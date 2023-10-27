# Summoner Spy

This is the backend repository of Summoner Spy project. Frontend can be found [here](https://github.com/marinactonci/SummonerSpy-client).
Consists of API calls for getting data from Riot's official API endpoints.
Backend is deployed to [summoner-spy.site](https://summoner-spy.site/).

Created APIs you can test out are:
- /free-rotation
- /summoners/:region/:summonerName
- /leaderboards/:server/:queueType

Notes:
- :region represents short form of a desired server. Ex. for EU Nordic & East server, region would be 'eune', for EU West, 'euw' and so on
- :server represents Riot's server code for a desired region. Ex. for EU Nordic & East, server would be eun1, for EU West, 'euw1'. Full list of server codes can be found [here](https://developer.riotgames.com/docs/lol#routing-values).
