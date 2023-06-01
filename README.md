## Brevo, HapiJS, and JWT Authentication Integration Exercise

:construction: THIS REPO IS UNDER HEAVY CONSTRUCTION

This repository is a simple HapiJS server with a very simple frontend that sends
an authentication email that has a JWT in it, this JWT is then reauthenticated
if the link sent is copied and pasted into the browser at this time.

**Upcoming challenges include:**

- [ ] While the JWT can indeed be authenticated upon navigating to '/validate/${JWT}', the route to home '/', does not currently recognize the stored JWT in the cookie. This needs to be addressed. There is some small clues provided in this hapijs discussion over at their [github repo](https://github.com/hapijs/hapi/issues/2970)