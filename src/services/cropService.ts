// src/services/cropService.ts

const CROP_API_KEY = '822gicMKPKvWCSNjzE9TFKMse0CwHQxpn0CbGKydZYucBkgNnD';
const CROP_API_URL = 'https://crop.kindwise.com/api/v1/identification';

export type DoencaResultado = {
  nome: string;
  probabilidade: number;
  descricao: string;
  tratamento: string;
  tipo: string;
  categoria: 'fungo' | 'bacteria' | 'praga' | 'nutricional' | 'outro';
};

export type ResultadoAnalise = {
  saudavel: boolean;
  alertaNutricional: boolean;
  plantaNome: string;
  plantaCientifico: string;
  doencas: DoencaResultado[];
  creditosRestantes: number | null;
};

const traducoes: Record<string, string> = {
  'grey mold': 'Mofo cinzento',
  'gray mold': 'Mofo cinzento',
  'powdery mildew': 'Oídio',
  'downy mildew': 'Míldio',
  'early blight': 'Pinta preta',
  'late blight': 'Requeima',
  'leaf blight': 'Queima das folhas',
  'leaf spot': 'Mancha foliar',
  'leaf rust': 'Ferrugem das folhas',
  'rust': 'Ferrugem',
  'anthracnose': 'Antracnose',
  'fusarium wilt': 'Murcha de fusário',
  'verticillium wilt': 'Murcha de verticílio',
  'black rot': 'Podridão negra',
  'brown rot': 'Podridão parda',
  'root rot': 'Podridão de raiz',
  'stem rot': 'Podridão do caule',
  'damping off': 'Tombamento',
  'sclerotinia': 'Esclerotínia',
  'alternaria': 'Alternária',
  'cercospora': 'Cercosporiose',
  'septoria': 'Septoriose',
  'botrytis': 'Botrite',
  'bacterial blight': 'Crestamento bacteriano',
  'bacterial spot': 'Mancha bacteriana',
  'bacterial wilt': 'Murcha bacteriana',
  'fire blight': 'Fogo bacteriano',
  'aphids': 'Pulgões',
  'spider mites': 'Ácaros',
  'whitefly': 'Mosca branca',
  'thrips': 'Tripes',
  'caterpillar': 'Lagarta',
  'nutrient deficiency': 'Deficiência nutricional',
  'nitrogen deficiency': 'Deficiência de nitrogênio',
  'iron deficiency': 'Deficiência de ferro',
  'healthy': 'Saudável',
};

function traduzir(nome: string): string {
  const nomeLower = nome.toLowerCase();
  return traducoes[nomeLower] ?? nome;
}

function categorizar(nome: string, tipo: string): DoencaResultado['categoria'] {
  const n = nome.toLowerCase();
  const t = tipo.toLowerCase();

  if (n.includes('nutrient') || n.includes('deficiency') || n.includes('deficiência')) return 'nutricional';
  if (t.includes('fung') || n.includes('mold') || n.includes('mildew') || n.includes('rust') ||
      n.includes('blight') || n.includes('rot') || n.includes('anthracnose') ||
      n.includes('botrytis') || n.includes('sclerotinia') || n.includes('alternaria') ||
      n.includes('cercospora') || n.includes('septoria') || n.includes('fusarium') ||
      n.includes('verticillium')) return 'fungo';
  if (t.includes('bacter') || n.includes('bacterial') || n.includes('fire blight')) return 'bacteria';
  if (t.includes('pest') || t.includes('insect') || n.includes('aphid') || n.includes('mite') ||
      n.includes('whitefly') || n.includes('thrips') || n.includes('caterpillar')) return 'praga';

  return 'outro';
}

export async function analisarPlanta(imagemBase64: string): Promise<ResultadoAnalise> {
  const corpo = {
    images: [`data:image/png;base64,${imagemBase64}`],
    similar_images: true,
  };

  const resposta = await fetch(CROP_API_URL + '?language=pt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': CROP_API_KEY,
    },
    body: JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(`Erro HTTP ${resposta.status}: ${textoErro}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dados: any = await resposta.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sugestoes: any[] = dados?.result?.crop?.suggestions ?? [];
  const plantaNome: string = sugestoes[0]?.name ?? 'Planta não identificada';
  const plantaCientifico: string = sugestoes[0]?.scientific_name ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doencasBruto: any[] = dados?.result?.disease?.suggestions ?? [];

  const doencas: DoencaResultado[] = doencasBruto
    .filter((d) => (d.probability ?? 0) >= 0.50)
    .filter((d) => (d.name ?? '').toLowerCase() !== 'healthy')
    .map((d) => ({
      nome: traduzir(d.name ?? 'Doença desconhecida'),
      probabilidade: parseFloat((d.probability ?? 0).toFixed(4)),
      descricao: (d.details?.description ?? '') as string,
      tratamento: (d.details?.treatment?.chemical?.[0] ?? '') as string,
      tipo: (d.details?.type ?? '') as string,
      categoria: categorizar(d.name ?? '', d.details?.type ?? ''),
    }))
    .sort((a, b) => b.probabilidade - a.probabilidade);

  const temProblemaReal = doencas.some(d => d.categoria !== 'nutricional');
  const temNutricional  = doencas.some(d => d.categoria === 'nutricional');
  const saudavel        = !temProblemaReal;
  const alertaNutricional = !temProblemaReal && temNutricional;

  return {
    saudavel,
    alertaNutricional,
    plantaNome,
    plantaCientifico,
    doencas,
    creditosRestantes: dados?.usage?.credits ?? null,
  };
}