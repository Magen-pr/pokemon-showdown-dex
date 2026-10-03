Pokémon Showdown Dex
========================================================================

Navigation: [Website][1] | [Server repository][2] | [Client repository][3] | **Dex repository**

  [1]: http://pokemonshowdown.com/
  [2]: https://github.com/Zarel/Pokemon-Showdown
  [3]: https://github.com/Zarel/Pokemon-Showdown-Client

Fangames Battles
------------------------------------------------------------------------

Esta rama es la Pokédex de [Fangames Battles](https://fangamesbattles.com), en español. Cada juego tiene su mod en el servidor y se elige arriba; la URL lleva el juego (`/anil/pokemon/cefireon`) y los enlaces sin él van al juego por defecto. Los juegos están en `games.json`.

    node build

genera `data/<juego>.js` a partir del servidor ya compilado (`serverDir` en `config/config.js`) y escribe `index.html`. `data/<juego>-game.js` (categoría, entrada de la Pokédex y método de evolución de cada especie) sale de los datos del juego.

Introduction
------------------------------------------------------------------------

This is a repository for [**Pokémon Showdown's Pokédex**][4].

This is what runs `dex.pokemonshowdown.com`.

  [4]: http://dex.pokemonshowdown.com/

Features
------------------------------------------------------------------------

Important features include:

- **Instant search** - start typing and search results will appear instantly

- **Filter search** - in the Pokémon search tab, type "prankster, twave" and press Enter to get a list of Pokémon with Prankster that can learn Thunder Wave

- **Panel UI** - clicking on anything will load it in a new panel to the right, for ease of navigation

- **Good layout** - get at important information with much less scrolling compared to most other Pokédexes

- **Basic inexact search** - type "pikaku" and Pikachu will still appear

- **Abbreviation search** - type "hjk" to match High Jump Kick

- **Nickname search** - type commonly-used community names like "pdon" to match Primal Groudon

Testing
------------------------------------------------------------------------

You can make and test changes simply by opening `testclient.html`.

License
------------------------------------------------------------------------

This dex is distributed under the terms of the [MIT license][5].

  [5]: https://github.com/smogon/pokemon-showdown/blob/master/LICENSE
