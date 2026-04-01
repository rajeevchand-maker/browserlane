export function renderDashboardHtml(emphasis: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Browserlane Demo Dashboard</title>
    <style>
      body {
        margin: 0;
        font-family: Georgia, serif;
        background: linear-gradient(180deg, #07111f, #0f1c30);
        color: #eef3f8;
      }
      main {
        max-width: 1080px;
        margin: 0 auto;
        padding: 48px 24px 64px;
      }
      .hero {
        padding: 28px;
        border-radius: 28px;
        background: rgba(13, 27, 45, 0.86);
        border: 1px solid rgba(110, 167, 255, 0.18);
      }
      .eyebrow {
        font-family: "IBM Plex Mono", Menlo, monospace;
        color: #80d8ff;
        letter-spacing: 0.16em;
        font-size: 12px;
        text-transform: uppercase;
      }
      h1 {
        font-size: 54px;
        margin: 10px 0 14px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-top: 28px;
      }
      .card {
        padding: 20px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(128, 216, 255, 0.12);
      }
      .callout {
        margin-top: 24px;
        padding: 18px 20px;
        border-radius: 18px;
        background: rgba(128, 216, 255, 0.08);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow">Browserlane demo</div>
        <h1>Quarterly Operations Console</h1>
        <p>Safe synthetic dashboard for runner validation and screenshot capture.</p>
        <div class="cards">
          <div class="card"><strong>18</strong><br />Automations reviewed</div>
          <div class="card"><strong>7</strong><br />Replay-ready workflows</div>
          <div class="card"><strong>${emphasis}</strong><br />Highlighted metric</div>
        </div>
        <div class="callout" id="callout">Workflow emphasis: ${emphasis}</div>
      </section>
    </main>
  </body>
</html>`;
}

export function renderFormHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Browserlane Demo Intake</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #08111f;
        color: #eef3f8;
        font-family: Georgia, serif;
      }
      form, .success {
        width: min(560px, calc(100% - 32px));
        padding: 28px;
        border-radius: 24px;
        background: rgba(15, 28, 48, 0.94);
        border: 1px solid rgba(128, 216, 255, 0.14);
      }
      label {
        display: block;
        margin-bottom: 16px;
      }
      input, select, button {
        width: 100%;
        margin-top: 8px;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(128, 216, 255, 0.18);
      }
      button {
        margin-top: 12px;
      }
      .success {
        display: none;
      }
      .success.is-visible {
        display: block;
      }
    </style>
  </head>
  <body>
    <form id="intake-form">
      <h1>Launch browser workflow</h1>
      <label>
        Workflow owner
        <input id="owner" name="owner" value="" />
      </label>
      <label>
        Priority
        <select id="priority" name="priority">
          <option value="standard">Standard</option>
          <option value="priority">Priority</option>
        </select>
      </label>
      <button type="submit">Create safe run</button>
    </form>
    <section class="success" id="success">
      <h2>Workflow created</h2>
      <p id="success-copy"></p>
    </section>
    <script>
      const form = document.getElementById("intake-form");
      const success = document.getElementById("success");
      const copy = document.getElementById("success-copy");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const owner = document.getElementById("owner").value;
        const priority = document.getElementById("priority").value;
        copy.textContent = owner + " / " + priority + " workflow queued";
        success.classList.add("is-visible");
      });
    </script>
  </body>
</html>`;
}
