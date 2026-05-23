import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { MOCK_PATIENTS, MOCK_SESSIONS } from '@/lib/mock-data';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, patientId } = await req.json();

    // Injeção de contexto do paciente
    let patientContext = '';
    if (patientId) {
      const patient = MOCK_PATIENTS.find(p => p.id === patientId);
      const sessions = MOCK_SESSIONS.filter(s => s.patientId === patientId);

      if (patient) {
        patientContext = `
CONTEXTO DO PACIENTE (CONFIDENCIAL):
Nome: ${patient.name}
Idade: ${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} anos
Status: ${patient.status}
Queixa principal: ${patient.chiefComplaint}
Histórico: ${patient.medicalHistory}
Medicações: ${patient.medications || 'Nenhuma'}
Total de sessões: ${patient.totalSessions}

SESSÕES RECENTES:
${sessions.slice(0, 3).map(s =>
  `- ${s.date} (${s.duration}min, ${s.status}): ${s.notes || 'sem anotações'}`
).join('\n')}
`;
      }
    }

    const systemPrompt = `Você é um assistente especializado para psicólogos clínicos.
Ajude o psicólogo a refletir sobre o caso, identificar padrões e planejar intervenções.

REGRAS IMPORTANTES:
- Você NÃO é o terapeuta do paciente. Você auxilia o PSICÓLOGO.
- Mantenha total confidencialidade. Não cite dados do paciente em contextos externos.
- Baseie suas respostas exclusivamente no contexto fornecido.
- Linguagem profissional, empática e baseada em evidências.
- Se não houver dados suficientes, diga claramente.
- Em caso de risco iminente ao paciente, oriente o psicólogo a tomar ação imediata.

${patientContext || 'Chat geral — nenhum paciente selecionado. Responda perguntas gerais sobre psicologia clínica.'}`;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      maxTokens: 800,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[chat route error]', error);
    return new Response(JSON.stringify({ error: 'Erro ao processar a solicitação.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
