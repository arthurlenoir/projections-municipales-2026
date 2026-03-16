import type { City } from '../types'

const COLORS = [
  '#5eb8f5', // 1 - bleu clair campagne (Delafosse/PS)
  '#1d3461', // 2 - bleu marine foncé (Jamet/RN)
  '#457b9d', // 3 - bleu centre-droit (Perrein/LR)
  '#c1121f', // 4 - rouge profond (Lachiver/LO)
  '#6d6875', // 5 - violet (Municipaliste)
  '#e9742a', // 6 - orange (Altrad/centre)
  '#e63946', // 7 - rouge vif (Oziol/LFI)
  '#52b788', // 8 - vert clair (Roumegas/écologie)
  '#c1121f', // 9 - rouge profond (Muller/RP)
  '#ffb703', // 10 - jaune (Yes We Clown)
  '#fb8500', // 11 - orange foncé (Trousselier)
  '#1d3461', // 12 - bleu marine foncé (Tsagalos/extrême droite)
  '#e9742a', // 13 - orange (Saurel/centre)
]

export const montpellierCity: City = {
  id: 'montpellier',
  name: 'Montpellier',
  totalSeats: 69,
  candidates: [
    {
      id: 'montpellier-1',
      listNumber: 1,
      listName: 'DEMAIN MONTPELLIER',
      headName: 'Michaël Delafosse',
      color: COLORS[0],
    },
    {
      id: 'montpellier-2',
      listNumber: 2,
      listName: 'LIBÉRER MONTPELLIER !',
      headName: 'France Jamet',
      color: COLORS[1],
    },
    {
      id: 'montpellier-3',
      listNumber: 3,
      listName: 'AIMER MONTPELLIER',
      headName: 'Isabelle Perrein',
      color: COLORS[2],
    },
    {
      id: 'montpellier-4',
      listNumber: 4,
      listName: 'LUTTE OUVRIÈRE',
      headName: 'Morgane Lachiver',
      color: COLORS[3],
    },
    {
      id: 'montpellier-5',
      listNumber: 5,
      listName: 'LA MUNICIPALISTE',
      headName: 'Kadija Zbairi',
      color: COLORS[4],
    },
    {
      id: 'montpellier-6',
      listNumber: 6,
      listName: 'MONTPELLIER NOTRE FIERTÉ',
      headName: 'Mohed Altrad',
      color: COLORS[5],
    },
    {
      id: 'montpellier-7',
      listNumber: 7,
      listName: 'FAIRE MIEUX POUR MONTPELLIER',
      headName: 'Nathalie Oziol',
      color: COLORS[6],
    },
    {
      id: 'montpellier-8',
      listNumber: 8,
      listName: 'LE PRINTEMPS MONTPELLIERAIN',
      headName: 'Jean-Louis Roumegas',
      color: COLORS[7],
    },
    {
      id: 'montpellier-9',
      listNumber: 9,
      listName: 'RÉVOLUTION PERMANENTE',
      headName: 'Max Muller',
      color: COLORS[8],
    },
    {
      id: 'montpellier-10',
      listNumber: 10,
      listName: 'YES WE CLOWN',
      headName: 'Rémi Gaillard',
      color: COLORS[9],
    },
    {
      id: 'montpellier-11',
      listNumber: 11,
      listName: "L'ARGENT POUR LES TRAVAILLEURS",
      headName: 'Sylvie Trousselier',
      color: COLORS[10],
    },
    {
      id: 'montpellier-12',
      listNumber: 12,
      listName: 'UNION MONTPELLIERAINE',
      headName: 'Thierry Tsagalos',
      color: COLORS[11],
    },
    {
      id: 'montpellier-13',
      listNumber: 13,
      listName: 'MONTPELLIER CITOYENNE',
      headName: 'Philippe Saurel',
      color: COLORS[12],
    },
  ],
  defaultFirstRound: {
    'montpellier-1':  33.41,
    'montpellier-2':  7.26,
    'montpellier-3':  7.50,
    'montpellier-4':  0.49,
    'montpellier-5':  0.20,
    'montpellier-6':  11.31,
    'montpellier-7':  15.36,
    'montpellier-8':  4.72,
    'montpellier-9':  1.40,
    'montpellier-10': 8.21,
    'montpellier-11': 0.15,
    'montpellier-12': 1.11,
    'montpellier-13': 8.86,
  },
}
