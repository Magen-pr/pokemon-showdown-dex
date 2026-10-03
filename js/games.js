/**
 * The game comes from the URL (/anil/pokemon/...); links without one go to
 * the default game. Loads that game's data and fills the game selector.
 * GameList is written into index.html by the build script.
 */
(function () {
	var id = location.pathname.split('/')[1];
	if (!GameList.games[id]) {
		id = GameList['default'];
		history.replaceState(null, null, '/' + id + location.pathname + location.search + location.hash);
	}
	var game = window.Game = GameList.games[id];
	game.id = id;
	game.root = '/' + id + '/';
	for (var i = 0; i < game.files.length; i++) {
		document.write('<script src="' + game.files[i] + '"><\/script>');
	}

	var select = document.querySelector('select.gameselect');
	for (var gameid in GameList.games) {
		var option = document.createElement('option');
		option.value = gameid;
		option.textContent = GameList.games[gameid].name;
		option.selected = gameid === id;
		select.appendChild(option);
	}
	select.onchange = function () {
		location.href = '/' + select.value + '/';
	};
	document.querySelector('.nav a.cur').href = game.root;
})();
