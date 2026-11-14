# postwork-poll

Live classroom app for FDS 100-6, "Meaningful Work and Play in a Post-Work World."

It has three kinds of activity:

1. **Polls.** Anonymous votes, hidden until you press Reveal.
2. **Human or machine?** Students rate two poems, guess which one an AI wrote, see the answer, and rate again.
3. **Job audit.** Students pick a career and sort its six tasks twice: once for today's AI, once for a perfect AI.

## Editing the content

Everything students see is in `content.js`: the poll questions, the poems, and the careers with their tasks. Edit the wording there and redeploy. You don't need to touch `server.js` or `public/index.html`.

## Deploying on Render

1. Create a new GitHub repository and upload everything in this folder.
2. On Render, create a new **Web Service** from that repository.
3. Build command: `npm install`. Start command: `npm start`.
4. Name the service `postwork-poll` so the address matches the QR codes on the slides (`postwork-poll.onrender.com`).

## Running it in class

1. Open the site on the projector, click "I'm the presenter," and start a room.
2. Students scan the QR code and type the room code.
3. Use **Questions** to jump to any activity, **Reveal results** to show the room's answers, and **Next step** inside the poem activity.
