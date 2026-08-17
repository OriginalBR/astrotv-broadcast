# AstroTv Control Suite — Mesa Profissional de Gráficos de Transmissão

> **Desenvolvido para a Imprensa Astro (TV Escolar)**: Um sistema completo, moderno e de alto padrão estético para controle ao vivo de overlays de transmissão jornalística e esportiva (estilo CNN Brasil, ESPN e Globo Esporte), com **sincronização em tempo real via WebSocket** integrado.

---

## ⚡ Conexão em Tempo Real via WebSocket (OBS Studio)

O OBS Studio roda suas fontes de navegador em processos isolados (*CEF Sandbox*). Para garantir que qualquer clique no painel do operador (gol no placar, troca de GC, disparo de vinheta) atualize **instantaneamente** na tela da transmissão, o AstroTv possui um **servidor WebSocket nativo** com:
- **Handshake Automático de Inicialização**: Assim que o OBS abre o overlay (`/output`), ele solicita o estado atual e carrega imediatamente os gráficos ativos.
- **Auto-Reconexão Inteligente**: Reconexão contínua a cada 2.5s se a rede oscilar.
- **Indicador Visual no Painel**: O operador vê em tempo real o status `🟢 WS Sincronizado (X dispositivos)`.

---

## 🚀 Como Rodar o Projeto

### 1. Iniciar o Servidor Completo (Vite + WebSocket Server)
```bash
npm run dev
```
O Vite iniciará o painel e o servidor WebSocket automaticamente nas portas:
- **Painel & Canvas**: `http://localhost:5173/` e `http://localhost:5173/output`
- **WebSocket**: `ws://localhost:5173/ws` (e porta dedicada `ws://localhost:8080`)

*(Opcional) Se quiser rodar apenas o servidor WebSocket em segundo plano separado:*
```bash
npm run server:ws
```

---

## 📺 Como Configurar no OBS Studio

1. Inicie o projeto com `npm run dev`.
2. No painel de controle do AstroTv, clique no botão **"Copiar Link OBS"** no cabeçalho ou use a URL:
   ```
   http://localhost:5173/output
   ```
3. No OBS Studio:
   - Em **Fontes** (*Sources*), clique no botão **+** e adicione **Navegador** (*Browser*).
   - Cole a URL: `http://localhost:5173/output`
   - **Largura (Width)**: `1920`
   - **Altura (Height)**: `1080`
   - **FPS**: `60`
   - Marque a opção: *"Atualizar o navegador quando a cena se tornar ativa"*.
4. **Pronto!** O fundo é 100% transparente. Tudo o que você fizer no painel do operador refletirá em tempo real no OBS Studio.

---

## 🎛️ Módulos de Overlays Incluídos

1. **Lower Thirds (GCs / Tarjas)**:
   - Noticiário Padrão, Entrevista VIP com Foto/Avatar, Plantão Urgente (Breaking News com efeito de alerta), Citação em Destaque, Moderno Minimalista e Perfil Aluno/Professor Imprensa Astro.
   - Animações: *Slide Lateral*, *Wipe*, *Fade Suave*, *Glitch TV*, *Scale Bounce* e *Slide Superior*.
   - Timer de auto-ocultação programável.

2. **Placares Esportivos ao Vivo**:
   - Modos: **Futsal/Futebol**, **Vôlei** (com sets), **Basquete** (com quartos e pontuação +1/+2/+3) e **Competições Gerais**.
   - Cronômetro de jogo com iniciar, pausar, zerar e ajuste de tempo.
   - Contadores de faltas, cartões amarelos 🟨 e vermelhos 🟥.
   - 3 layouts: *Bug Compacto Superior Esquerdo*, *Barra Inferior ESPN* e *Topo Central Flutuante*.

3. **Ticker (Letreiro de Notícias Corridas)**:
   - Rolagem contínua (Marquee) ou plantão estático piscante.
   - Velocidade ajustável (10s a 60s).
   - Manchetes com tags coloridas (*URGENTE*, *ESPORTES*, *EVENTOS*, *CLIMA*) e reordenação.

4. **Bugs / Logos / Marca d'Água & Relógio**:
   - Posicionamento nos 4 cantos ou coordenadas livres X/Y.
   - Selo animado **"AO VIVO"** com ponto pulsante.
   - Relógio em tempo real no fuso de Brasília (24h/12h) e data opcional.
   - Upload de logos PNG/SVG com transparência.

5. **Contagem Regressiva (Countdown)**:
   - Display digital gigante para início de transmissão e intervalos comerciais.
   - Disparo automático de vinheta de transição ao zerar.

6. **Vinhetas & Transições (Stingers)**:
   - Animações: *Wipe Esporte*, *Glitch Cyber TV*, *Zoom Blur Impact*, *Logo Stinger* e *Iris Circular*.
   - Sintetizador Web Audio API integrado (efeitos sonoros gerados em tempo real).

7. **Gráficos em Tela Cheia (Slides & Infográficos)**:
   - Cards explicativos com estatísticas, números gigantes, grade de agenda/cronograma e citações.

8. **Motor de Exportação Multiformato**:
   - **Pacote HTML Standalone**: Arquivo autocontido para fonte de navegador local.
   - **PNG 1920×1080 Transparente**: Imagem Full HD com canal alfa.
   - **Vídeo WebM Animado**: Gravação com transparência (VP9/VP8).
   - **Backup JSON**: Exportação e importação de presets e configurações de marca.

---

## ⌨️ Atalhos de Teclado (Live Switching)

| Tecla | Ação |
| :--- | :--- |
| <kbd>1</kbd> | Colocar / Tirar Lower Third do Ar |
| <kbd>2</kbd> | Colocar / Tirar Placar do Ar |
| <kbd>3</kbd> | Colocar / Tirar Ticker do Ar |
| <kbd>4</kbd> | Colocar / Tirar Bug / Logo do Ar |
| <kbd>5</kbd> | Colocar / Tirar Contagem Regressiva do Ar |
| <kbd>6</kbd> | Colocar / Tirar Slide Tela Cheia do Ar |
| <kbd>Espaço</kbd> | Disparar Vinheta de Transição Imediata |
| <kbd>P</kbd> | Iniciar / Pausar Cronômetro do Placar |
| <kbd>A</kbd> | +1 Gol / Ponto para o Time A |
| <kbd>B</kbd> | +1 Gol / Ponto para o Time B |
| <kbd>Esc</kbd> | **BLACKOUT** / Limpar Todos os Overlays Imediatamente |
