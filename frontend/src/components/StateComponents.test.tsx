import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Loading, ErrorState, EmptyState, PageHeader } from './StateComponents.tsx'
import CourseCard from './CourseCard.tsx'
import type { Course } from '../types'

const mockCourse: Course = {
  id: 1,
  title: 'Introduction to LLMs',
  description: 'Learn the basics of Large Language Models',
  level: 'beginner',
  thumbnail_url: 'https://example.com/thumb.jpg',
  author: 'Ryan Vo',
  tags: ['llm', 'ai', 'beginner'],
  is_published: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  modules_count: 5,
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('StateComponents', () => {
  test('Loading renders with message', () => {
    renderWithRouter(<Loading message="Loading courses..." />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading courses...')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('Loading renders with different sizes', () => {
    renderWithRouter(
      <div>
        <Loading size="sm" />
        <Loading size="md" />
        <Loading size="lg" />
      </div>
    )
    const spinners = screen.getAllByRole('status')
    expect(spinners).toHaveLength(3)
  })

  test('ErrorState renders message and retry button', () => {
    const handleRetry = vi.fn()
    renderWithRouter(<ErrorState message="Something went wrong" onRetry={handleRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  test('ErrorState renders without retry button when no handler', () => {
    renderWithRouter(<ErrorState message="Error" />)
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  test('EmptyState renders title, message, and action', () => {
    const handleAction = vi.fn()
    renderWithRouter(
      <EmptyState
        title="No courses"
        message="No courses found"
        actionLabel="Create course"
        onAction={handleAction}
      />
    )
    expect(screen.getByText('No courses')).toBeInTheDocument()
    expect(screen.getByText('No courses found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create course' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create course' }))
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  test('EmptyState renders without action when not provided', () => {
    renderWithRouter(<EmptyState title="Empty" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('PageHeader renders title, description, and action', () => {
    renderWithRouter(
      <PageHeader
        title="Courses"
        description="Browse courses"
        action={<button>Add</button>}
      />
    )
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Browse courses')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })
})

describe('CourseCard', () => {
  test('renders course title, level, author, and module count', () => {
    renderWithRouter(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Introduction to LLMs')).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Ryan Vo')).toBeInTheDocument()
    expect(screen.getByText('5 modules')).toBeInTheDocument()
  })

  test('renders tags', () => {
    renderWithRouter(<CourseCard course={mockCourse} />)
    expect(screen.getByText('llm')).toBeInTheDocument()
    expect(screen.getByText('ai')).toBeInTheDocument()
    expect(screen.getByText('beginner')).toBeInTheDocument()
  })

  test('links to course detail page', () => {
    renderWithRouter(<CourseCard course={mockCourse} />)
    const link = screen.getByRole('link', { name: /introduction to llms/i })
    expect(link).toHaveAttribute('href', '/courses/1')
  })

  test('shows +N for extra tags', () => {
    const courseWithManyTags = {
      ...mockCourse,
      tags: ['a', 'b', 'c', 'd', 'e'],
    }
    renderWithRouter(<CourseCard course={courseWithManyTags} />)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  test('renders without thumbnail when not provided', () => {
    const courseNoThumb = { ...mockCourse, thumbnail_url: null }
    renderWithRouter(<CourseCard course={courseNoThumb} />)
    expect(screen.queryByAltText('')).not.toBeInTheDocument()
  })

  test('renders intermediate and advanced levels with correct styling', () => {
    const intermediateCourse = { ...mockCourse, id: 2, level: 'intermediate' as const }
    const advancedCourse = { ...mockCourse, id: 3, level: 'advanced' as const }

    renderWithRouter(<CourseCard course={intermediateCourse} />)
    expect(screen.getByText('Intermediate')).toBeInTheDocument()

    renderWithRouter(<CourseCard course={advancedCourse} />)
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })
})