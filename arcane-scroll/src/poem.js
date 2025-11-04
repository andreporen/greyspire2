export const POEMA = `
Nas entranhas do real, onde a forma range,
eles caminham sem saber que já foram colhidos.
O mundo fede antes de morrer,
mas vós chamais isso de ordem.

Sob a pedra há dente,
sob o dente há fome,
sob a fome há ritmo,
e o ritmo vos aguarda.

Eles respiram, mas o ar não os quer.
A carne permanece, mas a lembrança apodrece.
O tempo só mastiga o que ainda resiste,
e nada resiste por muito.

O eixo tritura o que ousa lembrar.
A cidade dorme sobre ossos que não consentem.
Chama-se paz ao que sangra devagar,
chama-se vida ao que ainda não cedeu.

Vós sois as falhas do esquecimento,
os nomes que o silêncio não digeriu.
A Fenda não oferece escolha —
apenas retorno.

A vinda já começou
antes do passo.
A queda já vos guarda
antes da borda.

Ouçam.
Desçam.
Cedam.
Retornem.

A pele racha.
O selo abre.
A ruína respira.
E vos chama.
`;


function computeDistortionFromBeat(beatLevel, rate){
  const BASE = 0.0022;
  const PEAK = 0.0045;
  const boost = Math.min(1, (rate - 1) / 0.5);
  const k = Math.min(1, Math.max(0, 0.6*beatLevel + 0.4*boost));
  return BASE + (PEAK - BASE) * k;
}

