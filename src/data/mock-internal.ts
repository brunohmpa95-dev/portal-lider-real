// Mock data for internal system — realistic Itaúna context

export const mockClients = [
  { id: '1', name: 'Carlos Eduardo Silva', cpf: '123.456.789-00', phone: '(37) 99901-1234', city: 'Itaúna', status: 'active', contracts: 2 },
  { id: '2', name: 'Maria Aparecida Santos', cpf: '987.654.321-00', phone: '(37) 99902-5678', city: 'Itaúna', status: 'active', contracts: 1 },
  { id: '3', name: 'José Roberto Oliveira', cpf: '456.789.123-00', phone: '(37) 99903-9012', city: 'Divinópolis', status: 'active', contracts: 1 },
  { id: '4', name: 'Ana Paula Ferreira', cpf: '321.654.987-00', phone: '(37) 99904-3456', city: 'Itaúna', status: 'inactive', contracts: 0 },
  { id: '5', name: 'Marcos Vinícius Costa', cpf: '654.321.987-00', phone: '(37) 99905-7890', city: 'Itaúna', status: 'active', contracts: 3 },
];

export const mockBrokers = [
  { id: '1', name: 'Rafael Mendes', creci: 'CRECI-MG 45678', region: 'Centro / São Geraldo', status: 'active', leads: 12, commission: 8500 },
  { id: '2', name: 'Patrícia Almeida', creci: 'CRECI-MG 56789', region: 'Residencial / Piedade', status: 'active', leads: 8, commission: 12300 },
  { id: '3', name: 'Fernando Lima', creci: 'CRECI-MG 67890', region: 'Industrial / Santa Edwiges', status: 'inactive', leads: 3, commission: 0 },
];

export const mockProposals = [
  { id: '1', property: 'Casa 3Q Centro - LDR-0045', client: 'Carlos Eduardo Silva', broker: 'Rafael Mendes', amount: 385000, status: 'pending', date: '2026-04-10' },
  { id: '2', property: 'Apto 2Q São Geraldo - LDR-0078', client: 'Maria Aparecida Santos', broker: 'Patrícia Almeida', amount: 245000, status: 'accepted', date: '2026-04-05' },
  { id: '3', property: 'Lote Residencial Piedade - LDR-0102', client: 'José Roberto Oliveira', broker: 'Rafael Mendes', amount: 120000, status: 'rejected', date: '2026-03-28' },
  { id: '4', property: 'Sala Comercial Centro - LDR-0115', client: 'Marcos Vinícius Costa', broker: 'Patrícia Almeida', amount: 1800, status: 'pending', date: '2026-04-12' },
];

export const mockCommissions = [
  { id: '1', broker: 'Rafael Mendes', property: 'Casa 3Q Centro', amount: 11550, status: 'pending', dueDate: '2026-05-15' },
  { id: '2', broker: 'Patrícia Almeida', property: 'Apto 2Q São Geraldo', amount: 7350, status: 'paid', paidAt: '2026-04-01' },
  { id: '3', broker: 'Rafael Mendes', property: 'Terreno Industrial', amount: 4200, status: 'paid', paidAt: '2026-03-15' },
];

export const mockContracts = [
  { id: '1', number: 'CTR-2026-001', type: 'Locação', client: 'Carlos Eduardo Silva', property: 'Casa 3Q Centro', status: 'active', startDate: '2026-01-01', endDate: '2027-01-01', monthlyValue: 1800 },
  { id: '2', number: 'CTR-2026-002', type: 'Venda', client: 'Maria Aparecida Santos', property: 'Apto 2Q São Geraldo', status: 'active', startDate: '2026-04-05', endDate: null, monthlyValue: null },
  { id: '3', number: 'CTR-2025-015', type: 'Locação', client: 'Marcos Vinícius Costa', property: 'Sala Comercial Centro', status: 'active', startDate: '2025-06-01', endDate: '2026-06-01', monthlyValue: 2200 },
  { id: '4', number: 'CTR-2025-008', type: 'Locação', client: 'José Roberto Oliveira', property: 'Apto 1Q Piedade', status: 'expired', startDate: '2024-12-01', endDate: '2025-12-01', monthlyValue: 950 },
];

export const mockTickets = [
  { id: '1', subject: 'Vazamento na cozinha', client: 'Carlos Eduardo Silva', category: 'Manutenção', priority: 'high', status: 'open', date: '2026-04-13' },
  { id: '2', subject: 'Segunda via de contrato', client: 'Maria Aparecida Santos', category: 'Documentos', priority: 'normal', status: 'in_progress', date: '2026-04-11' },
  { id: '3', subject: 'Dúvida sobre reajuste', client: 'Marcos Vinícius Costa', category: 'Financeiro', priority: 'normal', status: 'open', date: '2026-04-14' },
  { id: '4', subject: 'Troca de fechadura', client: 'José Roberto Oliveira', category: 'Manutenção', priority: 'low', status: 'completed', date: '2026-04-02' },
];

export const mockBrokerLeads = [
  { id: '1', name: 'Fernanda Souza', phone: '(37) 99911-2233', interest: 'Casa 3Q Centro', stage: 'new', source: 'Site', lastContact: null },
  { id: '2', name: 'Ricardo Barbosa', phone: '(37) 99922-3344', interest: 'Apto 2Q São Geraldo', stage: 'contacted', source: 'WhatsApp', lastContact: '2026-04-12' },
  { id: '3', name: 'Juliana Martins', phone: '(37) 99933-4455', interest: 'Lote Residencial', stage: 'visiting', source: 'Indicação', lastContact: '2026-04-10' },
  { id: '4', name: 'André Pereira', phone: '(37) 99944-5566', interest: 'Sala Comercial', stage: 'proposal', source: 'Site', lastContact: '2026-04-14' },
];

export const mockBrokerVisits = [
  { id: '1', property: 'Casa 3Q Centro', client: 'Fernanda Souza', date: '2026-04-16T10:00', status: 'scheduled', notes: '' },
  { id: '2', property: 'Apto 2Q São Geraldo', client: 'Ricardo Barbosa', date: '2026-04-15T14:30', status: 'completed', notes: 'Cliente demonstrou interesse, pediu mais fotos.' },
  { id: '3', property: 'Lote Residencial Piedade', client: 'Juliana Martins', date: '2026-04-17T09:00', status: 'scheduled', notes: '' },
];

export const mockAuditLogs = [
  { id: '1', actor: 'Admin Sistema', action: 'Alterou status do contrato', module: 'Contratos', entity: 'CTR-2025-008', date: '2026-04-14T16:32' },
  { id: '2', actor: 'Rafael Mendes', action: 'Registrou visita', module: 'Visitas', entity: 'Casa 3Q Centro', date: '2026-04-14T11:15' },
  { id: '3', actor: 'Admin Sistema', action: 'Upload de documento', module: 'Documentos', entity: 'Contrato locação - Carlos', date: '2026-04-13T09:20' },
  { id: '4', actor: 'Patrícia Almeida', action: 'Atualizou lead', module: 'Leads', entity: 'Ricardo Barbosa', date: '2026-04-12T15:45' },
];
