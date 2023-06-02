## Brevo, HapiJS, and JWT Authentication Integration Exercise

:construction: THIS REPO IS UNDER HEAVY CONSTRUCTION

This repository is a simple HapiJS server with a very simple frontend that sends
an authentication email that has a JWT in it, this JWT is then reauthenticated
if the link sent is copied and pasted into the browser at this time.

__TODO:__

- [ ] Clean up logic, compartmentalize email parameters
- [ ] Add other sensitive JWT parameters to .env to enforce better defaults for
future projects
- [ ] For personal use, consider using nodemailer instead of Brevo (this might be flawed thinking mind you)