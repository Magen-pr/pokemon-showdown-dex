/**
 * Pokémon Añil: the dex shows the gen9anil mod (data/anil.js) in Spanish,
 * using the client's text files.
 */

var ANIL_FORMAT = 'gen9ailsingles';
var AnilDex = Dex.mod('gen9anil');

Dex.text.getLanguage = function () {
	return 'es';
};
Dex.loadTextData('es');
// the game's names and descriptions win over the official ones
Dex.text.get = AnilDex.text.get;

var Names = {
	species: function (species) {
		if (typeof species === 'string') species = Dex.species.get(species);
		return Dex.text.get(species).name;
	},
	/** species name with the forme in small text, as HTML */
	speciesHTML: function (species) {
		if (typeof species === 'string') species = Dex.species.get(species);
		var name = Names.species(species);
		if (species.forme) {
			var base = Names.species(species.baseSpecies);
			if (name.startsWith(base + '-')) {
				return BattleLog.escapeHTML(base) + '<small>' + BattleLog.escapeHTML(name.slice(base.length)) + '</small>';
			}
		}
		return BattleLog.escapeHTML(name);
	},
	/** forme name without the species, for forme lists */
	forme: function (species) {
		var name = Names.species(species);
		var base = Names.species(species.baseSpecies);
		if (name.startsWith(base + '-')) return name.slice(base.length + 1);
		return name;
	},
	move: function (move) {
		return Dex.text.get(Dex.moves.get(move)).name;
	},
	item: function (item) {
		return Dex.text.get(Dex.items.get(item)).name;
	},
	ability: function (ability) {
		return Dex.text.get(Dex.abilities.get(ability)).name;
	},
	desc: function (effect) {
		var text = Dex.text.get(effect);
		return text.desc || text.shortDesc || '';
	},
	shortDesc: function (effect) {
		var text = Dex.text.get(effect);
		return text.shortDesc || text.desc || '';
	},
	type: function (type) {
		return TL.type[type] || type;
	},
	category: function (category) {
		return TL.tag[toID(category)] || category;
	},
	eggGroup: function (eggGroup) {
		return TL.egggroup[eggGroup] || eggGroup;
	},
	color: function (color) {
		return TL.color[color] || color;
	},
	stat: function (stat) {
		return TL.stat[stat] || stat;
	},
	statShort: function (stat) {
		return TL.statShort[stat] || stat;
	},
	/** bolds the part of `name` that matches the search, ignoring accents */
	highlight: function (name, query) {
		var html = BattleLog.escapeHTML(name);
		if (!query) return html;
		var plain = '';
		var map = [];
		for (var i = 0; i < name.length; i++) {
			var c = toID(name.charAt(i).normalize('NFD'));
			for (var j = 0; j < c.length; j++) {
				plain += c.charAt(j);
				map.push(i);
			}
		}
		var start = -1;
		for (var k = 0; k < plain.length; k++) {
			if (plain.substr(k, query.length) !== query) continue;
			if (!k || !/[a-z0-9]/i.test(name.charAt(map[k] - 1))) {
				start = k;
				break;
			}
			if (start < 0) start = k;
		}
		if (start < 0) return html;
		var from = map[start];
		var to = map[Math.min(start + query.length, plain.length) - 1] + 1;
		return BattleLog.escapeHTML(name.slice(0, from)) + '<b>' + BattleLog.escapeHTML(name.slice(from, to)) + '</b>' +
			BattleLog.escapeHTML(name.slice(to));
	},
};
