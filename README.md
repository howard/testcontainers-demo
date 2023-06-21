# Testcontainers Demo

This demo is part of a presentation at the [Salzburg Web Dev Meetup June 2023](https://www.meetup.com/salzburgwebdev/events/293568750/).
Slides are available [here](#TODO).

## Prerequisites

Docker must be installed and executable without requiring interaction (e.g. `sudo` password).
Docker Desktop should work out of the box.
On Linux, it's usually necessary to add your user to the `docker` group and starting a fresh desktop session for the group change to take effect.
This should even work with Docker for Windows 🤯 .

## Setup

1.  `npm install`
2.  `docker-compose up`

By default, the API is available at `0.0.0.0:8080`.

## API

This demo consists of a simple API that is backed by Redis.
These operations are available:

* `GET /:term` - returns the count for this particular term.
* `POST /:term` - increments this term's counter by 1.
* `DELETE /:term` - resets the count and forgets the term.
* `GET /` - lists all terms that have been incremented before along with their count.
* `DELETE /` - resets all counts and forgets all terms.

## Tests

This is the interesting part.
Check the sources and run them using `npm test`.

To see the benefits of Testcontainers, compare `test/api.{mock,real}.spec.js`:
Both feature the same test cases, one of them using mocks, one of them with real Redis.

Spoiler alert: Although the tests using mocks aren't that much verbose (~20% longer), their coverage is much less thorough.
Additionally, using mocks requires piercing through abstraction layers, whereas the Testcontainers version stays consistently on the API level. 
