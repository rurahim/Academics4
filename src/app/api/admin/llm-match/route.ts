import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  batchMatchSubjectsWithLLM,
  checkOllamaHealth,
  calculateFullMatch,
  matchCause,
  matchFields,
} from '@/lib/llm-matcher'

/**
 * POST /api/admin/llm-match
 *
 * Test LLM-based subject matching
 *
 * Request body:
 * {
 *   "volunteerSubjects": ["Artificial Intelligence", "Machine Learning"],
 *   "studentSubjects": ["AI", "Deep Learning"],
 *   "volunteerCause": "education",
 *   "studentCause": "education",
 *   "volunteerFields": ["Computer Science"],
 *   "studentFields": ["Information Technology"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      volunteerSubjects = [],
      studentSubjects = [],
      volunteerCause,
      studentCause,
      volunteerFields = [],
      studentFields = [],
      fullMatch = false,
    } = body

    // Check Ollama health first
    const ollamaHealthy = await checkOllamaHealth()

    if (!ollamaHealthy) {
      return NextResponse.json(
        {
          error: 'Ollama is not running',
          message: 'Please start Ollama with: ollama serve',
          instructions: [
            '1. Install Ollama: brew install ollama',
            '2. Start Ollama: ollama serve',
            '3. Download model: ollama pull qwen2.5:1.5b',
          ],
        },
        { status: 503 }
      )
    }

    // Full match with all criteria
    if (fullMatch && volunteerCause && studentCause) {
      const result = await calculateFullMatch(
        {
          causes: Array.isArray(volunteerCause) ? volunteerCause : [volunteerCause],
          fieldsOfExpertise: volunteerFields,
          subjectsQualified: volunteerSubjects,
        },
        {
          cause: studentCause,
          fieldsOfStudy: studentFields,
          topicsNeedSupport: studentSubjects,
        }
      )

      return NextResponse.json({
        success: true,
        mode: 'full_match',
        result,
      })
    }

    // Subject-only matching
    if (volunteerSubjects.length > 0 && studentSubjects.length > 0) {
      const subjectResult = await batchMatchSubjectsWithLLM(
        studentSubjects,
        volunteerSubjects
      )

      // Also include hard-coded results for comparison
      const causeResult =
        volunteerCause && studentCause
          ? matchCause(volunteerCause, studentCause)
          : null

      const fieldResult =
        volunteerFields.length > 0 && studentFields.length > 0
          ? matchFields(volunteerFields, studentFields)
          : null

      return NextResponse.json({
        success: true,
        mode: 'subject_match',
        ollamaStatus: 'healthy',
        subjectMatch: subjectResult,
        causeMatch: causeResult,
        fieldMatch: fieldResult,
      })
    }

    return NextResponse.json(
      {
        error: 'Missing required fields',
        required: {
          forSubjectMatch: ['volunteerSubjects', 'studentSubjects'],
          forFullMatch: [
            'fullMatch: true',
            'volunteerCause',
            'studentCause',
            'volunteerSubjects',
            'studentSubjects',
          ],
        },
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('LLM match error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/llm-match
 *
 * Check Ollama health status
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ollamaHealthy = await checkOllamaHealth()

    return NextResponse.json({
      ollama: {
        status: ollamaHealthy ? 'healthy' : 'unavailable',
        url: process.env.OLLAMA_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b',
      },
      instructions: ollamaHealthy
        ? ['Ollama is running and ready']
        : [
            '1. Install Ollama: brew install ollama',
            '2. Start Ollama: ollama serve',
            '3. Download model: ollama pull qwen2.5:1.5b',
          ],
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
