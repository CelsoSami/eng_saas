/**
 * URB1 Engine — Consulta de Zoneamento de Campo Grande/MS
 * Dados do PDDUA, categorias de uso, cálculo de potencial construtivo
 */
const URB1 = (() => {

  // ─── 1. BANCO DE DADOS — BAIRROS ───
  const CSV = `Aero Rancho|Z3|ZA3|0.40|25%|0.60|0.40
Alves Pereira|Z4|ZA4|0.45|30%|0.60|0.40
Amambaí|Z1|ZA1|0.36|20%|0.40|0.60
América|Z3|ZA3|0.40|25%|0.60|0.40
Autonomista|Z3|ZA3|0.40|25%|0.30|0.70
Bandeirantes|Z3|ZA3|0.40|25%|0.50|0.50
Batistão|Z4|ZA4|0.45|30%|0.50|0.50
Bela Vista|Z2|ZA3|0.40|25%|0.40|0.60
Cabreúva|Z2|ZA2|0.38|25%|0.40|0.60
Caiçara|Z4|ZA3|0.40|25%|0.50|0.50
Caiobá|Z5|ZA5|0.50|30%|0.70|0.30
Carandá|Z3|ZA3|0.40|25%|0.30|0.70
Carlota|Z3|ZA3|0.40|25%|0.60|0.40
Carvalho|Z2|ZA3|0.40|25%|0.50|0.50
Centenário|Z4|ZA5|0.50|30%|0.60|0.40
Centro|Z1|ZA1|0.36|20%|0.30|0.70
Centro-Oeste|Z4|ZA4|0.45|30%|0.70|0.30
Chácara Cachoeira|Z3|ZA3|0.40|25%|0.30|0.70
Chácara dos Poderes|Z5|ZA5|0.50|30%|0.70|0.30
Coophavila II|Z4|ZA4|0.45|30%|0.60|0.40
Coronel Antonino|Z4|ZA4|0.45|30%|0.40|0.60
Cruzeiro|Z2|ZA2|0.38|25%|0.30|0.70
Dr. Albuquerque|Z4|ZA4|0.45|30%|0.40|0.60
Estrela Dalva|Z4|ZA4|0.45|30%|0.40|0.60
Glória|Z2|ZA3|0.40|25%|0.30|0.70
Guanandi|Z3|ZA3|0.40|25%|0.60|0.40
Itanhangá|Z2|ZA3|0.40|25%|0.40|0.60
Jacy|Z3|ZA3|0.40|25%|0.40|0.60
Jardim dos Estados|Z1|ZA1|0.36|20%|0.40|0.60
Jardim Paulista|Z3|ZA3|0.40|25%|0.40|0.60
Jockey Club|Z3|ZA3|0.40|25%|0.40|0.60
José Abrão|Z4|ZA5|0.50|30%|0.60|0.40
Lageado|Z5|ZA5|0.50|30%|0.60|0.40
Leblon|Z4|ZA3|0.40|25%|0.60|0.40
Los Angeles|Z5|ZA5|0.50|30%|0.60|0.40
Margarida|Z3|ZA3|0.40|25%|0.30|0.70
Maria Aparecida Pedrossian|Z4|ZA4|0.45|30%|0.50|0.50
Mata do Jacinto|Z3|ZA3|0.40|25%|0.60|0.40
Mata do Segredo|Z5|ZA5|0.50|30%|0.60|0.40
Monte Castelo|Z4|ZA3|0.40|25%|0.40|0.60
Monte Líbano|Z2|ZA3|0.40|25%|0.40|0.60
Moreninha|Z4|ZA4|0.45|30%|0.50|0.50
Nasser|Z4|ZA3|0.40|25%|0.50|0.50
Noroeste|Z4|ZA4|0.45|30%|0.70|0.30
Nova Campo Grande|Z5|ZA5|0.50|30%|0.70|0.30
Nova Lima|Z4|ZA4|0.45|30%|0.60|0.40
Novos Estados|Z4|ZA4|0.45|30%|0.40|0.60
Núcleo Industrial|Z5|ZA5|0.50|30%|0.50|0.50
Panamá|Z4|ZA4|0.45|30%|0.60|0.40
Parati|Z3|ZA3|0.40|25%|0.60|0.40
Pioneiros|Z4|ZA4|0.45|30%|0.50|0.50
Piratininga|Z3|ZA3|0.40|25%|0.50|0.50
Planalto|Z2|ZA2|0.38|25%|0.50|0.50
Popular|Z4|ZA5|0.50|30%|0.50|0.50
Rita Vieira|Z4|ZA4|0.45|30%|0.50|0.50
Santa Fé|Z1|ZA2|0.38|25%|0.50|0.50
Santo Amaro|Z4|ZA4|0.45|30%|0.50|0.50
Santo Antônio|Z4|ZA4|0.45|30%|0.60|0.40
São Bento|Z2|ZA3|0.40|25%|0.40|0.60
São Conrado|Z5|ZA5|0.50|30%|0.50|0.50
São Francisco|Z2|ZA2|0.38|25%|0.50|0.50
São Lourenço|Z3|ZA3|0.40|25%|0.50|0.50
Seminário|Z4|ZA5|0.50|30%|0.40|0.60
Sobrinho|Z4|ZA3|0.40|25%|0.50|0.50
Taquarussu|Z3|ZA3|0.40|25%|0.40|0.60
Tarumã|Z5|ZA5|0.50|30%|0.50|0.50
Taveirópolis|Z4|ZA3|0.40|25%|0.50|0.50
Tijuca|Z4|ZA4|0.45|30%|0.50|0.50
Tiradentes|Z3|ZA3|0.40|25%|0.50|0.50
TV Morena|Z3|ZA3|0.40|25%|0.50|0.50
União|Z4|ZA4|0.45|30%|0.50|0.50
Universitário|Z4|ZA4|0.45|30%|0.50|0.50
Veraneio|Z3|ZA5|0.50|30%|0.60|0.40
Vilasboas|Z3|ZA3|0.40|25%|0.50|0.50`;

  const bairros = CSV.split('\n').map(line => {
    const [nome, z, za, tra, perm, alfa, beta] = line.split('|');
    return { nome, z, za, tra: parseFloat(tra), perm, alfa: parseFloat(alfa), beta: parseFloat(beta) };
  });

  // ─── 2. ZONEAMENTO URBANO ───
  const urbano = {
    Z1: { ocupacao: 'Térreo e 1º: 0,7 · demais: 0,5', camin: '0,10', cabas: '4', camax: '5', outorga: '1', ie: 'Livre', area: '250 m²', esquina: '15 m', meio: '10 m', frente: 'Térreo e 1º pavimento: livre. Demais pavimentos: 5,00 m.', lateral: 'Térreo e 1º: livre. IE entre 2 e <6: h/6 (mín. 3 m). IE ≥6 e <12: h/8 (mín. 3 m). IE ≥12: h/10 (mín. 5 m).', outorgaRec: 'Térreo e 1º: livre. IE entre 2 e <6: h/6 (mín. 3 m). IE ≥6 e <12: h/8 (mín. 3 m). IE ≥12: h/10 (mín. 5 m).', notas: [6, 7] },
    Z2: { ocupacao: '0,5', camin: '0,10', cabas: '3', camax: '5', outorga: '2', ie: '6', area: '250 m²', esquina: '15 m', meio: '10 m', frente: 'IE maior que 2: 5,00 m.', lateral: 'Térreo e 1º: livre. IE entre 2 e 6: h/6 (mín. 3 m).', outorgaRec: 'Térreo e 1º: livre. IE entre 2 e <6: h/6 (mín. 3 m). IE ≥6 e <12: h/8 (mín. 3 m). IE ≥12: h/10 (mín. 5 m).', notas: [1, 2, 3, 8] },
    Z3: { ocupacao: '0,5', camin: '0,10', cabas: '2', camax: '4', outorga: '2', ie: '4', area: '250 m²', esquina: '15 m', meio: '10 m', frente: 'IE maior que 2: 5,00 m.', lateral: 'IE até 2: livre. IE maior que 2: h/4 (mín. 3 m).', outorgaRec: 'Térreo e 1º: livre. IE entre 2 e <6: h/6 (mín. 3 m). IE ≥6: h/8 (mín. 5 m).', notas: [1, 2, 4] },
    Z4: { ocupacao: '0,5', camin: '0,10', cabas: '2', camax: '3', outorga: '1', ie: '4', area: '250 m²', esquina: '15 m', meio: '10 m', frente: 'IE maior que 2: 5,00 m.', lateral: 'IE até 2: livre. IE maior que 2: h/4 (mín. 3 m).', outorgaRec: 'Térreo e 1º: livre. IE entre 2 e 6: h/6 (mín. 3 m).', notas: [5] },
    Z5: { ocupacao: '0,5', camin: '0,10', cabas: '1', camax: '1,5', outorga: '0,5', ie: '2', area: '250 m²', esquina: '15 m', meio: '10 m', frente: 'Livre.', lateral: 'Livre.', outorgaRec: 'IE até 2: livre. IE maior que 2: h/4 (mín. 3 m).', notas: [9] }
  };

  // ─── 3. NOTAS ───
  const notas = {
    1: 'Em edifícios multirresidenciais com fachada ativa: ocupação de 0,7 no térreo e 1º pavimento; 0,5 nos demais.',
    2: 'Com fachada ativa: recuo frontal livre no térreo e 1º pavimento; 5,00 m nos demais.',
    3: 'Com Outorga Onerosa/TDC, o Índice de Elevação passa a ser livre.',
    4: 'Com Outorga Onerosa/TDC, o Índice de Elevação passa a 8.',
    5: 'Com Outorga Onerosa/TDC, o Índice de Elevação passa a 6.',
    6: 'Em edifícios multirresidenciais, há desconto de 20% na outorga quando a fachada ativa tiver área construída mínima de 20% da taxa de ocupação.',
    7: 'Em edifícios multirresidenciais com fachada ativa, a ocupação do térreo pode chegar a 0,8 mediante contrapartida financeira.',
    8: 'Em edifícios multirresidenciais com fachada ativa e área construída mínima de 20% da taxa de ocupação, há desconto de 20% na outorga após a compra do primeiro coeficiente.',
    9: 'Com Outorga Onerosa/TDC, o Índice de Elevação passa a 3.'
  };

  // ─── 4. CATEGORIAS DE USO ───
  const desc = {
    iLeve: 'Alimentos preparados, vestuário, tecidos, artigos esportivos, calçados, instrumentos musicais, vassouras, gelo, brinquedos, fitas magnéticas, ótica e artigos para bebê.',
    iMedia: 'Material elétrico, sal misturado, conserva, condimentos, artefatos de fibrocimento, cerâmica para mesa, bicicletas, artesanato, papel, espuma, borracha, plástico e artigos de escritório.',
    iPesada: 'Sabão, detergente, cosméticos, eletrodomésticos, ferragens, ferramentas, material hospitalar, máquinas, laticínios, metalurgia, recauchutagem, bebidas, fumo, autopeças, fiação, tecelagem e tingimento.',
    atacGeral: 'Ourivesaria, livros, instrumentos musicais, roupas, tecidos, calçados, vestuário, CDs, brinquedos, artigos para festas, cama/mesa/banho, artigos religiosos, ótica, fotografia, informática, material eletrônico, bebidas, autopeças e telefonia.',
    atacEspecial: 'Eletrodomésticos, caça e pesca, esportivos, material de escritório, purificadores, bicicletas, panelas, higiene, alimentos, medicamentos, animais de pequeno porte, material elétrico e hidráulico, couro, pneus, móveis e papelaria.',
    atacPesado: 'Material de construção, produtos extrativistas, tintas, madeira, adubos, fertilizantes, lubrificantes, sucatas, veículos, motocicletas, veículos pesados, implementos agrícolas, ferragens, máquinas, vidro, espelhos e GLP.',
    varejoGeral: 'Alimentos, vestuário, calçados, informática, papelaria, mercado, supermercado, centro comercial, galeria, salas, salão comercial, açougue, peixaria, bebidas, farmácia, higiene, tecidos, livros, ótica, telefonia, brinquedos, flores, artesanato, loteria, GLP e artigos diversos.',
    varejoEspecial: 'Eletrodomésticos, móveis, eletrônicos, vidraçaria, produtos veterinários, serviços médicos e odontológicos, próteses, agência de veículos, locação de veículos leves, pet shop, caça e pesca, armas, esportivos, selaria e equipamentos de segurança.',
    varejoAuto: 'Material hidráulico e elétrico, pisos, azulejos, ferragens, cutelaria, autopeças, lubrificantes, acessórios, pneus, concessionárias, tintas, animais de pequeno porte e clínica veterinária com internação.',
    servLeve: 'Autônomos, escritórios, agenciamento de mão de obra, reparos eletrônicos, informática, bicicletaria, alimentação, restaurantes, lanchonetes, bares, cozinha industrial, panificadora, padaria, confeitaria, doceria, vestuário, imobiliária, turismo, corretora, aluguel de roupas, consultórios sem internação, academia, despachante, autoescola e cursos.',
    servAdm: 'Dedetização, limpeza, serigrafia, estamparia, pensão, laboratórios, estacionamento, hotel, bancos, financeiras, seguradoras, choperia, agência postal, lotérica, jogos eletrônicos, produção de mudas e centro empresarial.',
    servAuto: 'Balanceamento, pneus, instalação de som, autoelétrica, escapamento, reparação de equipamentos, refrigeração, gráfica, aluguel de equipamentos, empacotamento, funerária, velório e serviços funerários.',
    servPesado: 'Oficina mecânica, transportadora, transporte, implementos agrícolas, reparação de equipamentos de grande porte, tornearia, usinagem, soldas, marmoraria, serralheria, marcenaria, galvanoplastia, aluguel de máquinas e veículos pesados, depósito fechado, construtora e montagem de equipamentos.'
  };

  const categories = [];
  const addCat = (code, group, description, porte, min = null, max = null, measure = 'area', parking = '') => categories.push({ code, group, description, porte, min, max, measure, parking });

  addCat('R1', 'Residencial', 'Uma unidade residencial.', '1 unidade', 1, 1, 'units', 'residencial');
  addCat('R2', 'Residencial', 'Conjunto residencial.', 'De 2 até 25 unidades', 2, 25, 'units', 'residencial');
  addCat('R3', 'Residencial', 'Conjunto residencial.', 'De 26 até 50 unidades', 26, 50, 'units', 'residencial');
  addCat('V1', 'Comércio varejista', desc.varejoGeral, 'Até 720 m²', 0, 720, 'area', 'comercio');
  addCat('V2', 'Comércio varejista', desc.varejoGeral, 'Acima de 720 m²', 720, null, 'area', 'comercio');
  addCat('V3', 'Comércio varejista', desc.varejoEspecial, 'Até 720 m²', 0, 720, 'area', 'comercio');
  addCat('V4', 'Comércio varejista', desc.varejoEspecial, 'Acima de 720 m²', 720, null, 'area', 'comercio');
  addCat('V5', 'Comércio varejista', desc.varejoAuto, 'Até 720 m²', 0, 720, 'area', 'comercio');
  addCat('V6', 'Comércio varejista', desc.varejoAuto, 'Acima de 720 m²', 720, null, 'area', 'comercio');
  addCat('V7', 'Comércio varejista', 'Material de construção; veículos pesados; implementos agrícolas; sucatas; produtos químicos; lenha; carvão mineral; madeira; artigos pirotécnicos e explosivos.', 'Qualquer porte', null, null, 'area', 'comercio');
  addCat('V8', 'Comércio varejista', 'Centro comercial, shopping center, galeria, grupo de lojas/salas, mercado, supermercado ou hipermercado.', 'Acima de 720 m² até 2.500 m²', 720, 2500, 'area', 'shopping');
  addCat('V9', 'Comércio varejista', 'Combustíveis para veículos automotores.', 'Qualquer porte', null, null, 'area', 'comercio');
  addCat('V10', 'Comércio varejista', 'Animais vivos de grande porte.', 'Qualquer porte', null, null, 'area', 'comercio');
  addCat('V11', 'Comércio varejista', 'Centro comercial, shopping center, galeria, grupo de lojas/salas, mercado, supermercado ou hipermercado.', 'Acima de 2.500 m² até 5.000 m²', 2500, 5000, 'area', 'shopping');
  addCat('A1', 'Comércio atacadista', desc.atacGeral, 'Até 500 m²', 0, 500, 'area', 'comercio');
  addCat('A2', 'Comércio atacadista', desc.atacGeral, 'Acima de 500 m² até 1.000 m²', 500, 1000, 'area', 'comercio');
  addCat('A3', 'Comércio atacadista', desc.atacEspecial + ' Inclui também os produtos da categoria A1 quando acima de 1.000 m².', 'Até 1.000 m²; ou A1 acima de 1.000 até 5.000 m²', 0, 5000, 'area', 'comercio');
  addCat('A4', 'Comércio atacadista', desc.atacEspecial, 'Acima de 1.000 m² até 5.000 m²', 1000, 5000, 'area', 'comercio');
  addCat('A5', 'Comércio atacadista', desc.atacPesado, 'Até 1.000 m²', 0, 1000, 'area', 'comercio');
  addCat('A6', 'Comércio atacadista', desc.atacPesado, 'Acima de 1.000 m² até 5.000 m²', 1000, 5000, 'area', 'comercio');
  addCat('A7', 'Comércio atacadista', 'Animais de grande porte e animais para criatório.', 'Qualquer porte', null, null, 'area', 'comercio');
  addCat('A8', 'Comércio atacadista', 'Combustíveis, lenha, carvão, hulha, produtos pirotécnicos, explosivos, solventes e produtos químicos.', 'Qualquer porte', null, null, 'area', 'comercio');
  addCat('A9', 'Comércio atacadista', desc.atacGeral + ' ' + desc.atacEspecial + ' ' + desc.atacPesado, 'Acima de 5.000 m²', 5000, null, 'area', 'comercio');
  addCat('S1', 'Serviços', desc.servLeve, 'Até 720 m²', 0, 720, 'area', 'servicos');
  addCat('S2', 'Serviços', desc.servLeve, 'Acima de 720 m²', 720, null, 'area', 'servicos');
  addCat('S3', 'Serviços', desc.servAdm, 'Até 720 m²', 0, 720, 'area', 'servicos');
  addCat('S4', 'Serviços', desc.servAdm, 'Acima de 720 m²', 720, null, 'area', 'servicos');
  addCat('S5', 'Serviços', desc.servAuto, 'Até 720 m²', 0, 720, 'area', 'servicos');
  addCat('S6', 'Serviços', desc.servAuto, 'Acima de 720 m²', 720, null, 'area', 'servicos');
  addCat('S7', 'Serviços', desc.servPesado, 'Até 720 m²', 0, 720, 'area', 'servicos');
  addCat('S8', 'Serviços', desc.servPesado, 'Acima de 720 m²', 720, null, 'area', 'servicos');
  addCat('S9', 'Serviços', 'Criatório e adestramento de animais, canil, silvicultura, extrativismo vegetal, produção de mudas e sementes, camping, colônia de férias, equitação terapêutica, escola de equitação e hípica.', 'Qualquer porte', null, null, 'area', 'servicos');
  addCat('S10', 'Serviços', 'Motel.', 'Qualquer porte', null, null, 'area', 'motel');
  addCat('S11', 'Serviços', 'Lavagem e lubrificação de veículos.', 'Qualquer porte', null, null, 'area', 'servicos');
  addCat('S12', 'Serviços', 'Igrejas, templos ecumênicos, escola pré-escolar, ensino fundamental e médio, MBA, centro de apoio e reabilitação sem alojamento.', 'Até 5.000 m²', 0, 5000, 'area', 'igreja');
  addCat('S13', 'Serviços', 'Cinema, teatro, anfiteatro, complexo cultural, biblioteca, museu, galeria, exposições, ginásio, quadra esportiva, centro esportivo, centro de reabilitação com alojamento, asilo, albergue e clubes.', 'Qualquer porte', null, null, 'area', 'auditorio');
  addCat('S14', 'Serviços', 'Hospital veterinário.', 'Qualquer porte', null, null, 'area', 'hospital');
  addCat('S15', 'Serviços', 'Associações, entidades de classe, partidos políticos e administração pública direta e indireta.', 'Qualquer porte', null, null, 'area', 'publico');
  addCat('S16', 'Serviços', 'Boates, danceterias, casa de show, casa de espetáculos, choperia, cachaçaria, whiskeria, bares e congêneres com música.', 'Qualquer porte', null, null, 'area', 'danca');
  addCat('S17', 'Serviços', 'Hospital ou clínica médica com internação.', 'Qualquer porte', null, null, 'area', 'hospital');
  addCat('S18', 'Serviços', 'Universidade, curso de ensino superior, centro de ensino superior.', 'Qualquer porte', null, null, 'area', 'faculdade');
  addCat('S19', 'Serviços', 'Igrejas, templos, escolas e centro de apoio/reabilitação sem alojamento.', 'Acima de 5.000 m²', 5000, null, 'area', 'igreja');
  addCat('S20', 'Serviços', 'Centro empresarial.', 'Qualquer porte', null, null, 'area', 'servicos');
  addCat('S21', 'Serviços', 'Edifício garagem.', 'Qualquer porte', null, null, 'area', 'servicos');
  addCat('I1', 'Industrial', desc.iLeve, 'Até 360 m²', 0, 360, 'area', 'industria');
  addCat('I2', 'Industrial', desc.iLeve, 'Acima de 360 m² até 1.000 m²', 360, 1000, 'area', 'industria');
  addCat('I3', 'Industrial', desc.iMedia, 'Até 500 m²', 0, 500, 'area', 'industria');
  addCat('I4', 'Industrial', desc.iLeve + ' ' + desc.iMedia, 'Acima dos limites até 1.000 m²', 500, 1000, 'area', 'industria');
  addCat('I5', 'Industrial', desc.iPesada + ' ' + desc.iMedia, 'Até 5.000 m², conforme atividade', 0, 5000, 'area', 'industria');
  addCat('I6', 'Industrial', desc.iPesada, 'Acima de 5.000 m²', 5000, null, 'area', 'industria');
  addCat('I7', 'Industrial', 'Beneficiamento de grãos, alimentos, sementes, café, arroz, erva-mate, vidro, usina de concreto, fundições, asfalto, fibra de vidro, veículos e implementos agrícolas.', 'Até 1.000 m²', 0, 1000, 'area', 'industria');
  addCat('I8', 'Industrial', 'Mesmas atividades da categoria I7.', 'Acima de 1.000 m²', 1000, null, 'area', 'industria');
  addCat('I9', 'Industrial', 'Óleo alimentício, abate, frigorífico, laticínios, soja, trigo, ração, açúcar, cerâmica cozida, químicos e petroquímicos, laminação, louças sanitárias, celulose, madeira, curtume e defensivos químicos.', 'Qualquer porte', null, null, 'area', 'industria');
  addCat('E1', 'Especial', 'Residencial.', 'De 51 até 100 unidades', 51, 100, 'units', 'residencial');
  addCat('E2', 'Especial', 'Residencial.', 'De 101 até 250 unidades', 101, 250, 'units', 'residencial');
  addCat('E3', 'Especial', 'Residencial.', 'Acima de 251 unidades', 251, null, 'units', 'residencial');
  addCat('E4', 'Especial', 'Infraestrutura, aterro sanitário, rodovias, ferrovias, hidrovias, estações de tratamento e transmissão de energia.', 'Qualquer porte', null, null, 'area', 'servicos');
  addCat('E5', 'Especial', 'Atacadista e industrial em condomínio.', 'Até 100 unidades', 0, 100, 'units', 'industria');
  addCat('E6', 'Especial', 'Atacadista e industrial em condomínio.', 'Acima de 100 unidades', 100, null, 'units', 'industria');
  addCat('E7', 'Especial', 'Agropecuária, parque de exposições e parque industrial.', 'Qualquer porte', null, null, 'area', 'exposicoes');
  addCat('E8', 'Especial', 'Centro de convenções, centro de eventos e feiras de negócios.', 'Qualquer porte', null, null, 'area', 'auditorio');
  addCat('E9', 'Especial', 'Campo de golfe, hipódromo, autódromo e estádio.', 'Qualquer porte', null, null, 'area', 'estadio');
  addCat('E10', 'Especial', 'Instalações militares.', 'Qualquer porte', null, null, 'area', 'presidio');
  addCat('E11', 'Especial', 'Cemitério e crematório.', 'Qualquer porte', null, null, 'area', 'cemiterio');
  addCat('E12', 'Especial', 'Instalações aeroportuárias e ferroviárias.', 'Qualquer porte', null, null, 'area', 'estacao');
  addCat('E13', 'Especial', 'Terminal de transporte urbano.', 'Qualquer porte', null, null, 'area', 'estacao');
  addCat('E14', 'Especial', 'Presídio e penitenciária.', 'Qualquer porte', null, null, 'area', 'presidio');
  addCat('E15', 'Especial', 'Extrativismo mineral.', 'Qualquer porte', null, null, 'area', 'industria');
  addCat('E16', 'Especial', 'Usina de lixo, aterro sanitário e compostagem.', 'Qualquer porte', null, null, 'area', 'industria');
  addCat('E17', 'Especial', 'Terminal rodoviário.', 'Qualquer porte', null, null, 'area', 'estacao');
  addCat('E18', 'Especial', 'Mercado e supermercado.', 'Acima de 5.000 m²', 5000, null, 'area', 'shopping');
  addCat('E19', 'Especial', 'Shopping center.', 'De 5.000 até 10.000 m²', 5000, 10000, 'area', 'shopping');
  addCat('E20', 'Especial', 'Shopping center.', 'Acima de 10.000 m²', 10000, null, 'area', 'shopping');
  addCat('E21', 'Especial', 'Terminal intermodal e porto seco.', 'Qualquer porte', null, null, 'area', 'servicos');

  // ─── 5. CATEGORIAS POR ZONA ───
  const allowed = {
    Z1: new Set(['R1', 'R2', 'R3', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V8', 'V9', 'V11', 'A1', 'A2', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S10', 'S11', 'S12', 'S13', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'I1', 'I2', 'I3', 'E1', 'E2', 'E3', 'E4', 'E10', 'E13', 'E19', 'E20']),
    Z2: new Set(['R1', 'R2', 'R3', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V8', 'V9', 'V11', 'A1', 'A2', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S10', 'S11', 'S12', 'S13', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'I1', 'I2', 'I3', 'E1', 'E2', 'E3', 'E4', 'E8', 'E13', 'E19', 'E20']),
    Z3: new Set(['R1', 'R2', 'R3', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V11', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A9', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'I1', 'I2', 'I3', 'I4', 'I5', 'E1', 'E2', 'E3', 'E4', 'E8', 'E10', 'E11', 'E13', 'E18', 'E19', 'E20']),
    Z4: new Set(['R1', 'R2', 'R3', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V11', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A9', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'I1', 'I2', 'I3', 'I4', 'I5', 'E1', 'E2', 'E3', 'E4', 'E7', 'E8', 'E10', 'E11', 'E12', 'E13', 'E18', 'E19', 'E20', 'E21']),
    Z5: new Set(['R1', 'R2', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V11', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A9', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'I1', 'I2', 'I3', 'I4', 'I5', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E11', 'E13', 'E14', 'E16', 'E17', 'E18', 'E19', 'E20'])
  };

  // Exceções especiais
  const excecoesZ3 = new Set(['Autonomista', 'São Bento', 'Bela Vista', 'Itanhangá']);
  const bairrosCemiterio = new Set(['Glória', 'Mata do Jacinto', 'Moreninha', 'Sobrinho', 'Pioneiros', 'Centenário', 'Seminário']);

  // ─── 6. REGRAS DE ESTACIONAMENTO ───
  const parkingRules = {
    residencial: { label: 'Residencial — 1 vaga/unidade', fn: (b, u, r, s, l) => { return { qtd: Math.ceil(u || 0), descarga: false, embarque: false }; } },
    comercio: { label: 'Comércio em geral — o maior resultado entre 1 vaga/60 m² construídos e 1 vaga/unidade', fn: (b, u, r, s, l) => { return { qtd: Math.max(Math.ceil((b || 0) / 60), Math.ceil(u || 0)), descarga: true, embarque: true }; } },
    servicos: { label: 'Serviços em geral — o maior resultado entre 1 vaga/60 m² construídos e 1 vaga/unidade', fn: (b, u, r, s, l) => { return { qtd: Math.max(Math.ceil((b || 0) / 60), Math.ceil(u || 0)), descarga: true, embarque: true }; } },
    industria: { label: 'Indústria — 1 vaga/100 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 100), descarga: true, embarque: false }; } },
    shopping: { label: 'Shopping/supermercado — 1 vaga/35 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 35), descarga: true, embarque: true }; } },
    restaurante: { label: 'Restaurante/lanchonete — 1 vaga/50 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 50), descarga: false, embarque: false }; } },
    hospital: { label: 'Hospital com internação — 1 vaga/60 m² (até 5.000 m²) ou /80 m² (acima)', fn: (b, u, r, s, l) => { const d = (b || 0) > 5000 ? 80 : 60; return { qtd: Math.ceil((b || 0) / d), descarga: false, embarque: true }; } },
    saude: { label: 'Saúde sem internação — 1 vaga/50 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 50), descarga: false, embarque: true }; } },
    hotel: { label: 'Hotel/pensão — 1 vaga/4 quartos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((r || 0) / 4), descarga: false, embarque: true }; } },
    motel: { label: 'Motel — 1 vaga/quarto', fn: (b, u, r, s, l) => { return { qtd: Math.ceil(r || 0), descarga: false, embarque: false }; } },
    aparthotel: { label: 'Apart-hotel — 1 vaga/2 quartos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((r || 0) / 2), descarga: false, embarque: true }; } },
    auditorio: { label: 'Auditório/cinema/teatro — 1 vaga/10 assentos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((s || 0) / 10), descarga: false, embarque: true }; } },
    igreja: { label: 'Capela/igreja/templo — 1 vaga/30 assentos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((s || 0) / 30), descarga: false, embarque: false }; } },
    estadio: { label: 'Estádio/autódromo — 1 vaga/20 assentos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((s || 0) / 20), descarga: false, embarque: false }; } },
    ginasio: { label: 'Ginásio esportivo — 1 vaga/20 assentos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((s || 0) / 20), descarga: false, embarque: true }; } },
    danca: { label: 'Boate/casa de show — 1 vaga/25 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 25), descarga: false, embarque: true }; } },
    banco: { label: 'Bancos — 1 vaga/50 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 50), descarga: true, embarque: false }; } },
    publico: { label: 'Edifício público — 1 vaga/50 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 50), descarga: false, embarque: true }; } },
    cemiterio: { label: 'Cemitério — 1 vaga/300 m² de terreno', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((l || 0) / 300), descarga: false, embarque: false }; } },
    clube: { label: 'Clube social/esportivo — 1 vaga/300 m² de terreno', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((l || 0) / 300), descarga: false, embarque: true }; } },
    diversoes: { label: 'Parque de diversões — 1 vaga/300 m² de terreno', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((l || 0) / 300), descarga: false, embarque: false }; } },
    exposicoes: { label: 'Parque de exposições — 1 vaga/200 m² de terreno', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((l || 0) / 200), descarga: true, embarque: true }; } },
    presidio: { label: 'Presídio/instalação militar — 1 vaga/200 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 200), descarga: true, embarque: true }; } },
    museu: { label: 'Museu/biblioteca — 1 vaga/100 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 100), descarga: false, embarque: true }; } },
    estacao: { label: 'Estação rodoviária — 1 vaga/100 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 100), descarga: true, embarque: true }; } },
    ferroaero: { label: 'Estação ferroviária/aeroviária — 1 vaga/200 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 200), descarga: true, embarque: true }; } },
    faculdade: { label: 'Faculdade/universidade — 10 vagas/sala de aula', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((u || 0) / 1) * 10, descarga: false, embarque: true }; } },
    velorio: { label: 'Velório/crematório — 1 vaga/50 m² construídos', fn: (b, u, r, s, l) => { return { qtd: Math.ceil((b || 0) / 50), descarga: false, embarque: true }; } }
  };

  // ─── 7. LARGURA MÍNIMA DE VIA ───
  const roadWidths = {
    '---': { width: 0, label: 'Nenhum' },
    '12m': { width: 12, label: '12 m' },
    '15m': { width: 15, label: '15 m' },
    '18m': { width: 18, label: '18 m' },
    '22m': { width: 22, label: '22 m' },
    '33m': { width: 33, label: '33 m' }
  };

  const getRoadWidth = (code) => {
    if (!code) return null;
    const map = {
      R1: '---', V1: '---', S1: '---', I1: '---', E4: '---', E15: '---',
      R2: '12m', S2: '12m', V3: '12m',
      R3: '15m', V2: '15m', V4: '15m', V5: '15m', A1: '15m', A2: '15m', A3: '15m', A4: '15m',
      S3: '15m', S4: '15m', S5: '15m', S6: '15m', S7: '15m', S8: '15m', S9: '15m', S10: '15m',
      S11: '15m', S12: '15m', S13: '15m', S14: '15m', S15: '15m', S16: '15m', S17: '15m',
      I2: '15m', I3: '15m', E1: '15m',
      V6: '18m', V7: '18m', V8: '18m', V9: '18m', V11: '18m',
      A5: '18m', A6: '18m', A8: '18m',
      S18: '18m', S19: '18m', S20: '18m',
      I4: '18m', I5: '18m',
      E2: '18m', E5: '18m', E8: '18m', E11: '18m', E14: '18m', E16: '18m', E18: '18m', E19: '18m',
      V10: '22m', A7: '22m', A9: '22m', I6: '22m',
      E3: '22m', E6: '22m', E7: '22m', E9: '22m', E10: '22m', E12: '22m', E13: '22m', E17: '22m',
      I7: '33m', I8: '33m', I9: '33m', E20: '33m', E21: '33m'
    };
    const key = map[code];
    if (!key) return null;
    return roadWidths[key];
  };

  // ─── 8. REQUISITOS DE INFRAESTRUTURA ───
  const getInfra = (code) => {
    const completa = { agua: true, pavimentacao: true, drenagem: true, esgoto: true, energia: true };
    const semInfra = { agua: false, pavimentacao: false, drenagem: false, esgoto: false, energia: false };
    const aguaEnergia = { agua: true, pavimentacao: false, drenagem: false, esgoto: false, energia: true };
    const aguaEsgotoEnergia = { agua: true, pavimentacao: false, drenagem: false, esgoto: true, energia: true };

    if (['R1', 'S1', 'E4', 'E15'].includes(code)) return semInfra;
    if (['V1', 'V2', 'V3', 'S2'].includes(code)) return aguaEnergia;
    if (['R2', 'R3', 'V4', 'V5', 'A1', 'A2', 'A3', 'A4', 'S3', 'S4', 'S20', 'I1', 'I2', 'I3', 'I4', 'E1', 'E10', 'E11'].includes(code)) return aguaEsgotoEnergia;
    if (code === 'E16') return { ...completa, energia: false };
    if (code === 'S21') return {};
    return completa;
  };

  // ─── 9. FUNÇÕES DE CÁLCULO ───

  function consultarBairro(nome) {
    return bairros.find(b => b.nome.toLowerCase() === nome.toLowerCase()) || null;
  }

  function listarBairros() {
    return bairros.map(b => b.nome);
  }

  function getZoneInfo(z) {
    return urbano[z] || null;
  }

  function getCategory(code) {
    return categories.find(c => c.code === code) || null;
  }

  function listCategoriesByGroup() {
    const groups = {};
    categories.forEach(c => {
      if (!groups[c.group]) groups[c.group] = [];
      groups[c.group].push(c);
    });
    return groups;
  }

  function isAllowed(code, zone, bairroNome) {
    const z = allowed[zone];
    if (!z) return false;
    if (!z.has(code)) return false;

    // Exceções Z3
    if (zone === 'Z3' && excecoesZ3.has(bairroNome)) {
      const blocked = new Set(['V7', 'A2', 'A3', 'A4', 'A5', 'A6', 'A9', 'S8', 'S14', 'I5', 'E18', 'E19', 'E20']);
      if (blocked.has(code)) return false;
    }

    // E11 apenas em bairros específicos
    if (code === 'E11' && !bairrosCemiterio.has(bairroNome)) return false;

    // E12, E21 em Z4 apenas Taveirópolis
    if (zone === 'Z4' && (code === 'E12' || code === 'E21') && bairroNome !== 'Taveirópolis') return false;

    return true;
  }

  function calcularPotencial(bairro, params) {
    const { area, frente, profundidade, via, built, units, rooms, seats, floors, height, useOutorga, catCode } = params;
    const z = bairro.z;
    const za = bairro.za;
    const u = urbano[z];
    const cat = getCategory(catCode);

    if (!u || !cat) return null;

    // Taxa de ocupação
    const to = z === 'Z1' ? 0.7 : 0.5;
    const footprint = area * to;

    // CA
    const cabas = parseFloat(u.cabas.replace(',', '.'));
    const camax = parseFloat(u.camax.replace(',', '.'));
    const basic = area * cabas;
    const maximo = area * camax;

    // Área permeável
    const permPct = parseFloat(bairro.perm) / 100;
    const permeable = area * permPct;

    // IE
    const ieBase = { Z1: Infinity, Z2: 6, Z3: 4, Z4: 4, Z5: 2 }[z];
    const ieOutorga = { Z1: Infinity, Z2: Infinity, Z3: 8, Z4: 6, Z5: 3 }[z];
    const ieLimit = useOutorga ? ieOutorga : ieBase;
    const ieCompatible = ieLimit === Infinity || floors <= ieLimit;
    const ieLabel = ieLimit === Infinity ? 'Livre' : `${ieLimit} pav.`;

    // Recuos
    const getExactSetbacks = (z, floors, height, useOutorga) => {
      let frontal = 0, lateral = 0, fundos = 0;
      const frText = ['Livre', '5,00 m'];
      let laText = 'Livre', ouText = '';

      if (z === 'Z5') {
        frontal = 0;
        lateral = 0;
        fundos = 0;
      } else if (floors <= 2) {
        frontal = 0;
        lateral = 0;
        fundos = 0;
      } else {
        frontal = 5;
        if (!useOutorga) {
          if (z === 'Z2') { lateral = Math.max(height / 6, 3); fundos = lateral; }
          else { lateral = Math.max(height / 4, 3); fundos = lateral; }
        } else {
          if (z === 'Z4') { lateral = Math.max(height / 6, 3); fundos = lateral; }
          else if (z === 'Z3') { lateral = floors <= 2 ? 0 : (floors < 6 ? Math.max(height / 6, 3) : Math.max(height / 8, 5)); fundos = lateral; }
          else { lateral = Math.max(height / 6, 3); fundos = lateral; }
        }
      }

      if (floors <= 2) laText = 'Livre';
      else if (!useOutorga) laText = `h/4 (mín. 3 m) = ${lateral.toFixed(1)} m`;
      else laText = z === 'Z3' ? (floors < 6 ? `h/6 (mín. 3 m) = ${lateral.toFixed(1)} m` : `h/8 (mín. 5 m) = ${lateral.toFixed(1)} m`) : `h/6 (mín. 3 m) = ${lateral.toFixed(1)} m`;

      return { frontal, lateral, fundos, frontalText: floors <= 2 || z === 'Z5' ? 'Livre' : '5,00 m', lateralText: laText };
    };

    const setbacks = getExactSetbacks(z, floors, height, useOutorga);

    // Permissão
    const permission = isAllowed(catCode, z, bairro.nome);

    // Porte
    let porteStatus = 'Livre';
    if (cat.min !== null || cat.max !== null) {
      const value = cat.measure === 'units' ? (units || 0) : (built || 0);
      if (cat.max === null) porteStatus = value >= (cat.min || 0) ? 'Compatível' : 'Pendente';
      else if (cat.min === 0) porteStatus = value <= cat.max ? 'Compatível' : 'Revisar';
      else porteStatus = (value > (cat.min || 0) && value <= cat.max) ? 'Compatível' : 'Pendente';
      if (cat.min === null && cat.max === null) porteStatus = 'Livre';
    }

    // Vagas
    const pr = parkingRules[cat.parking];
    let parkingResult = { qtd: 0, descarga: false, embarque: false };
    if (pr) {
      parkingResult = pr.fn(built || 0, units || 0, rooms || 0, seats || 0, area);
    }

    // Via
    const road = getRoadWidth(catCode);
    let roadOk = null;
    if (road) {
      if (road.width === 0) roadOk = true;
      else if (!via) roadOk = null;
      else roadOk = via >= road.width;
    }

    // Via ajustada condicional
    let adjustedRoad = road;
    if (catCode === 'V7' || catCode === 'A5' || catCode === 'E14') {
      if ((built || 0) <= 500) adjustedRoad = roadWidths['15m'];
    }
    if (catCode === 'S20' && (built || 0) <= 2500) adjustedRoad = roadWidths['15m'];
    if (catCode === 'E10' && (built || 0) <= 2500) adjustedRoad = roadWidths['18m'];
    if (catCode === 'E2' && (units || 0) <= 200) adjustedRoad = roadWidths['15m'];
    if (catCode === 'R2' && (units || 0) <= 6) adjustedRoad = null;

    // Verdict
    const ok = permission && porteStatus !== 'Revisar' && ieCompatible;
    const warn = permission && ieCompatible && (porteStatus === 'Pendente' || roadOk === null);
    const no = !permission || !ieCompatible;

    let verdict = { type: 'ok', title: 'Uso possível', text: `A categoria ${catCode} consta entre os usos permitidos para ${z}, sujeita às demais condições do lote e do licenciamento.` };
    if (warn) { verdict = { type: 'warn', title: 'Uso possível, com informações a confirmar', text: `A categoria ${catCode} é permitida em ${z}, mas algumas informações complementares são necessárias.` }; }
    if (no) { verdict = { type: 'no', title: 'Uso não permitido', text: `A categoria ${catCode} não é permitida em ${z} ou o número de pavimentos excede o limite.` }; }

    // Infra
    const infra = getInfra(catCode);

    return {
      footprint, footprintSub: `${to * 100}% do terreno no pavimento de referência`,
      basic, basicSub: `potencial sem aquisição adicional`,
      maximo, maximoSub: `quando admitidos os instrumentos`,
      permeable, permeableSub: `${bairro.perm} do lote · TRA mínima ${bairro.tra}`,
      ieCompatible, ieLabel, ieSub: useOutorga ? `${floors} pav. · limite ${ieLabel} com outorga/TDC` : `${floors} pav. · ${ieLabel} sem outorga/TDC`,
      parking: parkingResult.qtd, parkingSub: parkingResult.qtd > 0 ? `${parkingResult.qtd} vagas estimadas` : 'Pendente',
      road: adjustedRoad, roadOk,
      porteStatus, porteSub: cat.porte,
      permission: { ok: permission },
      verdict,
      setbacks,
      infra,
      parkingDescarga: parkingResult.descarga,
      parkingEmbarque: parkingResult.embarque,
      parkingLabel: pr ? pr.label : ''
    };
  }

  // ─── 10. USOS POR GRUPO ───
  function getUsosPorGrupo(zone, bairroNome) {
    const grupos = {};
    categories.forEach(c => {
      if (isAllowed(c.code, zone, bairroNome)) {
        if (!grupos[c.group]) grupos[c.group] = [];
        grupos[c.group].push(c);
      }
    });
    return grupos;
  }

  // ─── API PÚBLICA ───
  return {
    consultarBairro,
    listarBairros,
    getZoneInfo,
    getCategory,
    listCategoriesByGroup,
    categories,
    isAllowed,
    calcularPotencial,
    getUsosPorGrupo,
    parkingRules,
    getRoadWidth,
    notas,
    urbano
  };
})();
