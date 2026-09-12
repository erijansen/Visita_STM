# Visita Institucional — Alte Esq Leonardo Puntel

Repositório estático para acompanhamento da agenda institucional do **Almirante de Esquadra Leonardo Puntel**, Ministro do Superior Tribunal Militar, na área do **Comando do 3º Distrito Naval**.

## O que o projeto entrega

- página inicial com retrato e identidades institucionais em fundo transparente e dimensões padronizadas;
- relógio em tempo real no fuso `America/Fortaleza` (BRT/UTC−3);
- identificação automática do **evento em andamento** e do **próximo evento**;
- **contagem regressiva em dias** para cada evento;
- agenda consolidada de João Pessoa, Fortaleza e Recife;
- deslocamentos aéreos registrados no documento-base;
- destaque explícito para hospedagem prevista em cada etapa;
- página de biografia com carreira, comissões, cursos e condecorações;
- layout mobile/tablet-first para iPhone, Android e tablets, preservando a versão desktop;
- menu principal em cards na primeira tela de dispositivos móveis;
- brasões padronizados em escala visual e fotografia reduzida no mobile;
- PWA/offline quando servido por HTTPS ou `localhost`;
- nenhuma biblioteca, CDN, fonte externa ou etapa de build.

## Estrutura

```text
.
├── index.html
├── agenda.html
├── biografia.html
├── manifest.webmanifest
├── sw.js
├── css/
│   └── styles.css
├── js/
│   ├── data.js       # agenda + biografia: edite aqui
│   └── app.js        # relógio, status e renderização
└── assets/
    └── img/
        ├── alte-esq-puntel.png
        ├── brasao-stm.png
        ├── brasao-com3dn.png
        ├── marca-marinha-branca.png
        └── marca-marinha.png
```

## Atualizar a programação

Edite apenas `js/data.js`. Cada evento contém os dados de programação, voos e hospedagem:

```js
{
  id: "fortaleza",
  city: "Fortaleza/CE",
  title: "...",
  start: "2026-10-14T00:00:00-03:00",
  end: "2026-10-16T23:59:59-03:00",
  dateLabel: "14 a 16OUT2026",
  venue: "...",
  lodging: "...",
  flights: [ ... ]
}
```

O JavaScript recalcula automaticamente:

- `AGORA` quando a hora atual está entre `start` e `end`;
- `PRÓXIMO` para o primeiro evento futuro;
- `CONCLUÍDO` para eventos encerrados;
- `Faltam N dias` com base na data local do fuso de Fortaleza.

## Executar localmente

Abrir `index.html` diretamente funciona para navegação e relógio. Para testar o modo PWA/offline via Service Worker, sirva a pasta com um servidor local, por exemplo:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Publicar no GitHub

> **Recomendação:** mantenha o repositório **privado**, pois o projeto contém agenda de autoridade. Não habilite GitHub Pages ou outra publicação pública sem autorização.

### Pela linha de comando

```bash
git init
git add .
git commit -m "Agenda institucional do Alte Esq Leonardo Puntel"
git branch -M main
git remote add origin SEU_REPOSITORIO_PRIVADO
git push -u origin main
```

### Pelo site do GitHub

1. Crie um novo repositório **Private**.
2. Faça upload de todos os arquivos e pastas deste pacote.
3. Mantenha a estrutura de diretórios.
4. Não ative Pages sem autorização para publicação.

## Fontes dos dados

- Programa de eventos fornecido pelo Com3ºDN.
- Biografia institucional do Ministro Alte Esq Leonardo Puntel, Superior Tribunal Militar.

## Observação sobre dados ainda pendentes

O documento-base informa que a programação detalhada de João Pessoa está “em anexo”, que a programação de Fortaleza está a cargo do Com3ºDN e 10ª CJM, e que a programação de Recife está aguardando. Assim, o repositório já está funcional com os dados disponíveis, mas foi estruturado para receber posteriormente horários e compromissos detalhados em `js/data.js`.
