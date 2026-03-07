import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/quizzes/[id]/attempt
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const body = await request.json()
    const { answers, timeSpent } = body

    // Check quiz exists and is published
    const quizzes = await sql`
      SELECT * FROM quizzes WHERE id = ${params.id} AND is_published = true
    `
    if (quizzes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found or not published' },
        { status: 404 }
      )
    }

    const userId = decoded.userId

    // Check if user has already attempted
    const existing = await sql`
      SELECT id FROM quiz_attempts WHERE quiz_id = ${params.id} AND student_id = ${userId}
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'You have already attempted this quiz' },
        { status: 400 }
      )
    }

    // Fetch questions with correct answers
    const questions = await sql`
      SELECT * FROM quiz_questions WHERE quiz_id = ${params.id} ORDER BY question_index
    `

    // Calculate score
    let correctAnswers = 0
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === questions[index].correct_answer
      if (isCorrect) correctAnswers++
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
      }
    })

    const score = correctAnswers
    const percentage = (score / questions.length) * 100
    const passed = percentage >= 60
    const averageTimePerQuestion = timeSpent / questions.length

    // Insert attempt
    const attemptResult = await sql`
      INSERT INTO quiz_attempts (quiz_id, student_id, submitted_at, score, percentage, passed, time_spent, average_time_per_question)
      VALUES (${params.id}, ${userId}, NOW(), ${score}, ${percentage}, ${passed}, ${timeSpent}, ${averageTimePerQuestion})
      RETURNING *
    `
    const attempt = attemptResult[0]

    // Insert answers
    for (const ans of processedAnswers) {
      await sql`
        INSERT INTO quiz_attempt_answers (attempt_id, question_index, selected_answer, is_correct, time_spent)
        VALUES (${attempt.id}, ${ans.questionIndex}, ${ans.selectedAnswer}, ${ans.isCorrect}, ${ans.timeSpent})
      `
    }

    // Update user stats
    await sql`UPDATE users SET quizzes_taken = quizzes_taken + 1 WHERE id = ${userId}`

    return NextResponse.json(
      {
        success: true,
        message: 'Quiz submitted successfully',
        results: {
          score,
          percentage,
          passed,
          totalQuestions: questions.length,
          correctAnswers,
          timeSpent,
          averageTimePerQuestion,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submit quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while submitting quiz' },
      { status: 500 }
    )
  }
}
