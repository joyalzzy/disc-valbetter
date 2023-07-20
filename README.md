# Bets
## Player bets
- rr
- kills
## Match bets
- win
- round diff
- score

# flow
- requests every 30 seconds if in game 
- if in game 
  - send discord ping to betters
  - to choose bet type
  - the bet type chose the most will be use
    - if same 
      - rng
  - the bet amount(everyone start with 100 creds)
  - if remake, cancels bet
  - if surrender, continue

# getting puid 
> the method i'm using requires the players to be online and val user to be in party(so client open)
- if online
  - will send party request
- if offline, 
  - use local cache

using [techchrism's docs](https://valapidocs.techchrism.me/)
[endpoints](https://gist.github.com/Kavan72/b6e0bfdf21d610148f64df878b8a2cc5)

# todo
- [ ] clear this spagget 
- [ ] write the actual thing
- [ ] make it so that the headers can be easily accessed e.g (headers1, headers2) in User instead of Auth

# api 
- 30/min
- 4/min 