'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'Home', path: '/' },
      { name: 'Experiments', path: '/topics' },
      { name: 'Lab Tests', path: '/quizzes' },
      { name: 'Lab Dashboard', path: '/dashboard' },
    ],
    resources: [
      { name: 'Study Materials', path: '#' },
      { name: 'Chemistry Formulas', path: '#' },
      { name: 'Periodic Table', path: '#' },
      { name: 'Lab Safety', path: '#' },
    ],
    chemistry: [
      { name: 'Organic Chemistry', path: '/topics?category=Organic Chemistry' },
      { name: 'Inorganic Chemistry', path: '/topics?category=Inorganic Chemistry' },
      { name: 'Physical Chemistry', path: '/topics?category=Physical Chemistry' },
      { name: 'Analytical Chemistry', path: '/topics?category=Analytical Chemistry' },
    ],
  }

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ]

  return (
    <footer className="glass-morphism border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <FlaskConical className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">Chem Hub</span>
            </Link>

            <p className="text-gray-300 mb-6 max-w-md">
              Empowering A/L chemistry students with a comprehensive social learning platform.
              Connect, learn, and excel together in the world of chemistry.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:text-primary-400 hover:bg-primary-500/20 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">The Lab</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Lab Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chemistry Topics */}
          <div>
            <h3 className="text-white font-semibold mb-4">Chemistry Topics</h3>
            <ul className="space-y-2">
              {footerLinks.chemistry.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-medium">Email</p>
              <p className="text-gray-300 text-sm">info@chemhub.lk</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-medium">Phone</p>
              <p className="text-gray-300 text-sm">+94 11 234 5678</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-medium">Location</p>
              <p className="text-gray-300 text-sm">Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {currentYear} Chem Hub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
