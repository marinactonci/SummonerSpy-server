# Summoner Spy

This is the backend repository of Summoner Spy project. Frontend can be found [here](https://github.com/marinactonci/SummonerSpy-client).
Consists of API calls for getting data from Riot's official API endpoints and for sending / receiving data from Firebase Database.
Backend is deployed to [summoner-spy.site](https://summoner-spy.site/).

Created APIs you can test out are:
- /free-rotation
- /summoner/:server/:summonerName
- /leaderboards/:server/:queueType

Notes:
- :server represents Riot's server code for a desired region. Ex. for EU Nordic & East, server would be eun1, for EU West, 'euw1'. Full list of server codes can be found [here](https://developer.riotgames.com/docs/lol#routing-values).
- :queueType is a code for wanted queue type. Can be either 'RANKED_SOLO_5x5' or 'RANKED_FLEX_SR'
