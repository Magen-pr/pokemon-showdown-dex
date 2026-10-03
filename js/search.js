/**
 * Search
 *
 * The client's oldclient/search.js, for the Añil dex: Spanish names, the
 * gen9anil format for typed searches, no tiers and no articles.
 *
 * Dependencies: jQuery, battledata, search-index, anil
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 */

(function (exports, $) {
	'use strict';

	function Search(elem, viewport) {
		this.$el = $(elem);
		this.el = this.$el[0];
		this.$viewport = (viewport ? $(viewport) : $(window));

		this.urlRoot = '';
		this.q = undefined; // uninitialized
		this.exactMatch = false;

		this.resultSet = null;
		this.filters = null;
		this.sortCol = null;
		this.renderedIndex = 0;
		this.renderingDone = true;
		this.externalFilter = false;
		this.cur = {};
		this.$inputEl = null;
		this.qType = '';

		this.engine = new DexSearch();
		window.search = this;

		var self = this;
		this.$el.on('click', '.more button', function (e) {
			e.preventDefault();
			self.updateScroll(true);
		});
		this.$el.on('click', '.filter', function (e) {
			e.preventDefault();
			self.removeFilter(e);
			if (self.$inputEl) self.$inputEl.focus();
		});
		this.$el.on('click', '.sortcol', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var sortCol = e.currentTarget.dataset.sort;
			self.engine.toggleSort(sortCol);
			self.sortCol = self.engine.sortCol;
			self.find('');
		});
	}

	Search.prototype.$ = function (query) {
		return this.$el.find(query);
	};

	//
	// Search functions
	//

	Search.prototype.find = function (query, firstElem) {
		if (!this.engine.find(query)) return; // nothing changed

		this.exactMatch = this.engine.exactMatch;
		this.q = this.engine.query;
		this.resultSet = this.cleanResults(this.engine.results);
		if (firstElem) {
			this.resultSet = [[this.engine.typedSearch.searchType, firstElem]].concat(this.resultSet);
			if (this.resultSet.length > 1 && ['sortpokemon', 'sortmove'].includes(this.resultSet[1][0])) {
				var sortRow = this.resultSet[1];
				this.resultSet[1] = this.resultSet[0];
				this.resultSet[0] = sortRow;
			}
		}
		if (this.filters) {
			this.resultSet = [['html', this.getFilterText()]].concat(this.resultSet);
		}

		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
		return true;
	};
	/** drops tiers and articles, and the headers left empty */
	Search.prototype.cleanResults = function (results) {
		var out = [];
		for (var i = 0; i < results.length; i++) {
			var row = results[i];
			if (row[0] === 'tier' || row[0] === 'article') continue;
			if (row[0] === 'html' && row[1].includes('No exact match found')) {
				row = ['html', '<em>No hay coincidencias exactas. Lo más parecido alfabéticamente:</em>'];
			}
			if (row[0] === 'header' && out.length && out[out.length - 1][0] === 'header') out.pop();
			out.push(row);
		}
		if (out.length && out[out.length - 1][0] === 'header') out.pop();
		return out;
	};
	Search.prototype.addFilter = function (node) {
		if (!node || !node.dataset.entry) return false;
		var entry = node.dataset.entry.split('|');
		var result = this.engine.addFilter(entry);
		this.filters = this.engine.filters;
		return result;
	};
	Search.prototype.removeFilter = function (e) {
		var result;
		if (e) {
			result = this.engine.removeFilter(e.currentTarget.value.split(':'));
		} else {
			result = this.engine.removeFilter();
		}
		this.filters = this.engine.filters;
		this.find('');
		return result;
	};
	Search.filterName = function (filter) {
		switch (filter[0]) {
		case 'move': return Names.move(filter[1]);
		case 'pokemon': return Names.species(filter[1]);
		case 'ability': return Names.ability(filter[1]);
		case 'type': return Names.type(filter[1]);
		case 'category': return Names.category(filter[1]);
		case 'egggroup': return Names.eggGroup(filter[1]);
		}
		return filter[1];
	};
	Search.prototype.getFilterText = function (q) {
		var buf = '<p>Filtros: ';
		for (var i = 0; i < this.filters.length; i++) {
			var text = BattleLog.escapeHTML(Search.filterName(this.filters[i]));
			buf += '<button class="filter" value="' + BattleLog.escapeHTML(this.filters[i].join(':')) + '">' + text + ' <i class="fa fa-times-circle"></i></button> ';
		}
		if (!q) buf += '<small style="color: #888">(retroceso = quitar filtro)</small>';
		return buf + '</p>';
	};
	Search.prototype.updateScroll = function (forceAdd) {
		if (this.renderingDone) return;
		var top = this.$viewport.scrollTop();
		var bottom = top + this.$viewport.height();
		var windowHeight = $(window).height();
		var i = this.renderedIndex;
		var finalIndex = Math.floor(bottom / 33) + 1;
		if (!forceAdd && finalIndex <= i) return;
		if (finalIndex < i + 20) finalIndex = i + 20;
		if (bottom - top > windowHeight && !i) finalIndex = 20;
		if (forceAdd && finalIndex > i + 40) finalIndex = i + 40;

		var resultSet = this.resultSet;
		var buf = '';
		while (i < finalIndex) {
			if (!resultSet[i]) {
				this.renderingDone = true;
				break;
			}
			var row = resultSet[i];

			var errorMessage = '';
			if (this.engine.filterLabel(row[0])) {
				errorMessage = '<span class="col filtercol"><em>Filtro</em></span>';
			} else if (this.engine.illegalLabel(row[1])) {
				errorMessage = '<span class="col illegalcol"><em>No disponible</em></span>';
			}

			buf += this.renderRow(row[1], row[0], errorMessage, row[1] in this.cur ? ' class="cur"' : '');

			i++;
		}

		if (!this.renderedIndex) {
			this.el.innerHTML = '<ul class="utilichart" style="height:' + (resultSet.length * 33) + 'px">' + buf + (!this.renderingDone ? '<li class="result more"><p><button class="button big">Más</button></p></li>' : '') + '</ul>';
			this.moreVisible = true;
		} else {
			if (this.moreVisible) {
				this.$el.find('.more').remove();
				if (!forceAdd) this.moreVisible = false;
			}
			$(this.el.firstChild).append(buf + (forceAdd && !this.renderingDone ? '<li class="result more"><p><button class="button big">Más</button></p></li>' : ''));
		}
		this.renderedIndex = i;
	};
	Search.prototype.setType = function (qType, cur) {
		this.qType = qType;
		this.engine.setType(qType, ANIL_FORMAT);
		this.filters = this.engine.filters;
		this.sortCol = this.engine.sortCol;
		this.cur = cur || {};

		var typedSearch = this.engine.typedSearch;
		if (qType === 'pokemon') {
			// dex order instead of tiers
			typedSearch.getBaseResults = function () {
				var results = this.getDefaultResults();
				for (var i = 0; i < results.length; i++) {
					if (results[i][0] === 'pokemon' && Dex.species.get(results[i][1]).num > 1025) {
						results.splice(i, 0, ['header', 'Pokémon Añil']);
						break;
					}
				}
				return results;
			};
		}
		var sort = typedSearch.sort;
		typedSearch.sort = function (results, sortCol, reverseSort) {
			if (sortCol !== 'name') return sort.call(this, results, sortCol, reverseSort);
			var getName = qType === 'pokemon' ? Names.species : Names.move;
			return results.sort(function (a, b) {
				return getName(a[1]).localeCompare(getName(b[1]), 'es') * (reverseSort ? -1 : 1);
			});
		};

		var firstElem;
		for (var id in cur) {
			firstElem = id;
			break;
		}
		this.find('', firstElem);
	};

	/*********************************************************
	 * Rendering functions
	 *********************************************************/

	// These all have static versions

	Search.prototype.renderRow = function (id, type, errorMessage, attrs) {
		switch (type) {
		case 'html':
			return '<li class="result">' + id + '</li>';
		case 'header':
			return '<li class="result"><h3>' + id + '</h3></li>';
		case 'sortpokemon':
			return this.renderPokemonSortRow();
		case 'sortmove':
			return this.renderMoveSortRow();
		case 'pokemon':
			return this.renderPokemonRow(Dex.species.get(id), errorMessage, attrs);
		case 'move':
			return this.renderMoveRow(Dex.moves.get(id), errorMessage, attrs);
		case 'item':
			return this.renderItemRow(Dex.items.get(id), errorMessage, attrs);
		case 'ability':
			return this.renderAbilityRow(Dex.abilities.get(id), errorMessage, attrs);
		case 'type':
			return this.renderTypeRow(id[0].toUpperCase() + id.substr(1), errorMessage);
		case 'egggroup':
			var egName = id[0].toUpperCase() + id.substr(1);
			if (id === 'humanlike') egName = 'Human-Like';
			else if (id === 'water1') egName = 'Water 1';
			else if (id === 'water2') egName = 'Water 2';
			else if (id === 'water3') egName = 'Water 3';
			return this.renderEggGroupRow(egName, errorMessage);
		case 'category':
			return this.renderCategoryRow(id[0].toUpperCase() + id.substr(1), errorMessage);
		}
		return '';
	};
	Search.prototype.renderPokemonSortRow = function () {
		var buf = '<li class="result"><div class="sortrow">';
		buf += '<button class="sortcol numsortcol' + (!this.sortCol ? ' cur' : '') + '">' + (!this.sortCol ? 'Orden: ' : 'N.º') + '</button>';
		buf += '<button class="sortcol pnamesortcol' + (this.sortCol === 'name' ? ' cur' : '') + '" data-sort="name">Nombre</button>';
		buf += '<button class="sortcol typesortcol' + (this.sortCol === 'type' ? ' cur' : '') + '" data-sort="type">Tipos</button>';
		buf += '<button class="sortcol abilitysortcol' + (this.sortCol === 'ability' ? ' cur' : '') + '" data-sort="ability">Habilidades</button>';
		var stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
		for (var i = 0; i < stats.length; i++) {
			buf += '<button class="sortcol statsortcol' + (this.sortCol === stats[i] ? ' cur' : '') + '" data-sort="' + stats[i] + '">' + Names.statShort(stats[i]) + '</button>';
		}
		buf += '<button class="sortcol statsortcol' + (this.sortCol === 'bst' ? ' cur' : '') + '" data-sort="bst">Tot.</button>';
		buf += '</div></li>';
		return buf;
	};
	Search.prototype.renderMoveSortRow = function () {
		var buf = '<li class="result"><div class="sortrow">';
		buf += '<button class="sortcol movenamesortcol' + (this.sortCol === 'name' ? ' cur' : '') + '" data-sort="name">Nombre</button>';
		buf += '<button class="sortcol movetypesortcol' + (this.sortCol === 'type' ? ' cur' : '') + '" data-sort="type">Tipo</button>';
		buf += '<button class="sortcol movetypesortcol' + (this.sortCol === 'category' ? ' cur' : '') + '" data-sort="category">Clase</button>';
		buf += '<button class="sortcol powersortcol' + (this.sortCol === 'power' ? ' cur' : '') + '" data-sort="power">Pot.</button>';
		buf += '<button class="sortcol accuracysortcol' + (this.sortCol === 'accuracy' ? ' cur' : '') + '" data-sort="accuracy">Prec.</button>';
		buf += '<button class="sortcol ppsortcol' + (this.sortCol === 'pp' ? ' cur' : '') + '" data-sort="pp">PP</button>';
		buf += '</div></li>';
		return buf;
	};
	Search.prototype.renderPokemonNameHTML = function (pokemon) {
		var q = this.q;
		var name = Names.species(pokemon);
		if (pokemon.forme) {
			var base = Names.species(pokemon.baseSpecies);
			if (name.startsWith(base + '-')) {
				return Names.highlight(base, q) + '<small>' + Names.highlight(name.slice(base.length), q) + '</small>';
			}
		}
		return Names.highlight(name, q);
	};
	Search.prototype.renderPokemonRow = function (pokemon, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!pokemon.exists) return '<li class="result">Pok&eacute;mon desconocido</li>';
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'pokemon/' + pokemon.id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="pokemon|' + BattleLog.escapeHTML(pokemon.name) + '">';

		buf += '<span class="col numcol">' + (pokemon.num > 0 ? pokemon.num : '') + '</span> ';

		buf += '<span class="col iconcol">';
		buf += '<span style="' + Dex.getPokemonIcon(pokemon) + '"></span>';
		buf += '</span> ';

		buf += '<span class="col pokemonnamecol">' + this.renderPokemonNameHTML(pokemon) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += Search.renderPokemonDetails(pokemon);

		buf += '</a></li>';

		return buf;
	};
	/** types, abilities and base stats */
	Search.renderPokemonDetails = function (pokemon) {
		var buf = '<span class="col typecol">';
		for (var i = 0; i < pokemon.types.length; i++) {
			buf += Dex.getTypeIcon(pokemon.types[i]);
		}
		buf += '</span> ';

		var abilities = pokemon.abilities;
		if (abilities['1']) {
			buf += '<span class="col twoabilitycol">' + Names.ability(abilities['0']) + '<br />' +
				Names.ability(abilities['1']) + '</span>';
		} else {
			buf += '<span class="col abilitycol">' + Names.ability(abilities['0']) + '</span>';
		}
		if (abilities['H']) {
			buf += '<span class="col abilitycol"><em>' + Names.ability(abilities['H']) + '</em></span>';
		} else {
			buf += '<span class="col abilitycol"></span>';
		}

		var stats = pokemon.baseStats;
		var bst = 0;
		for (var stat in stats) {
			buf += '<span class="col statcol"><em>' + Names.statShort(stat) + '</em><br />' + stats[stat] + '</span> ';
			bst += stats[stat];
		}
		buf += '<span class="col bstcol"><em>Total<br />' + bst + '</em></span> ';
		return buf;
	};
	Search.prototype.renderTaggedPokemonRowInner = function (pokemon, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'pokemon/' + pokemon.id + '" data-target="push"';
		var buf = '<a' + attrs + ' data-entry="pokemon|' + BattleLog.escapeHTML(pokemon.name) + '">';

		buf += '<span class="col tagcol shorttagcol">' + tag + '</span> ';

		buf += '<span class="col iconcol">';
		buf += '<span style="' + Dex.getPokemonIcon(pokemon) + '"></span>';
		buf += '</span> ';

		buf += '<span class="col shortpokemonnamecol">' + Names.speciesHTML(pokemon) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '<span style="float:left;min-height:26px">';
		buf += Search.renderPokemonDetails(pokemon);
		buf += '</span>';

		buf += '</a>';

		return buf;
	};

	Search.prototype.renderItemRow = function (item, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!item.exists) return '<li class="result">Objeto desconocido</li>';
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'items/' + item.id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="item|' + BattleLog.escapeHTML(item.name) + '">';

		buf += '<span class="col itemiconcol">';
		buf += '<span style="' + Dex.getItemIcon(item) + '"></span>';
		buf += '</span> ';

		buf += '<span class="col namecol">' + Names.highlight(Names.item(item), this.q) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '<span class="col itemdesccol">' + BattleLog.escapeHTML(Names.shortDesc(item)) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderAbilityRow = function (ability, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!ability.exists) return '<li class="result">Habilidad desconocida</li>';
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'abilities/' + ability.id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="ability|' + BattleLog.escapeHTML(ability.name) + '">';

		buf += '<span class="col namecol">' + Names.highlight(Names.ability(ability), this.q) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '<span class="col abilitydesccol">' + BattleLog.escapeHTML(Names.shortDesc(ability)) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	/** type, category, power, accuracy, PP and description */
	Search.renderMoveDetails = function (move) {
		var buf = '<span class="col typecol">';
		buf += Dex.getTypeIcon(move.type);
		buf += Dex.getCategoryIcon(move.category);
		buf += '</span> ';

		var pp = (move.pp === 1 || move.noPPBoosts ? move.pp : move.pp * 8 / 5);
		buf += '<span class="col labelcol">' + (move.category !== 'Status' ? ('<em>Pot.</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol"><em>Prec.</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + pp + '</span> ';

		buf += '<span class="col movedesccol">' + BattleLog.escapeHTML(Names.shortDesc(move)) + '</span> ';
		return buf;
	};
	Search.prototype.renderMoveRow = function (move, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!move.exists) return '<li class="result">Movimiento desconocido</li>';
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'moves/' + move.id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="move|' + BattleLog.escapeHTML(move.name) + '">';

		buf += '<span class="col movenamecol">' + Names.highlight(Names.move(move), this.q) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += Search.renderMoveDetails(move);

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderMoveRowInner = function (move, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + move.id + '" data-target="push"';
		var buf = '<a' + attrs + ' data-entry="move|' + BattleLog.escapeHTML(move.name) + '">';

		buf += '<span class="col movenamecol">' + BattleLog.escapeHTML(Names.move(move)) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += Search.renderMoveDetails(move);

		buf += '</a>';

		return buf;
	};
	Search.prototype.renderTaggedMoveRow = function (move, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + move.id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="move|' + BattleLog.escapeHTML(move.name) + '">';

		buf += '<span class="col tagcol">' + tag + '</span> ';

		buf += '<span class="col shortmovenamecol">' + BattleLog.escapeHTML(Names.move(move)) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += Search.renderMoveDetails(move);

		buf += '</a></li>';

		return buf;
	};

	Search.prototype.renderTypeRow = function (type, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'types/' + toID(type) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="type|' + BattleLog.escapeHTML(type) + '">';

		buf += '<span class="col namecol">' + Names.highlight(Names.type(type), this.q) + '</span> ';

		buf += '<span class="col typecol">' + Dex.getTypeIcon(type) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderCategoryRow = function (category, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'categories/' + toID(category) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="category|' + BattleLog.escapeHTML(category) + '">';

		buf += '<span class="col namecol">' + Names.highlight(Names.category(category), this.q) + '</span> ';

		buf += '<span class="col typecol">' + Dex.getCategoryIcon(category) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderEggGroupRow = function (egggroup, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'egggroups/' + toID(egggroup) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="egggroup|' + BattleLog.escapeHTML(egggroup) + '">';

		buf += '<span class="col namecol">' + Names.highlight(Names.eggGroup(egggroup), this.q) + '</span> ';

		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};

	Search.renderRow = Search.prototype.renderRow;
	Search.renderPokemonRow = Search.prototype.renderPokemonRow;
	Search.renderPokemonNameHTML = Search.prototype.renderPokemonNameHTML;
	Search.renderTaggedPokemonRowInner = Search.prototype.renderTaggedPokemonRowInner;
	Search.renderItemRow = Search.prototype.renderItemRow;
	Search.renderAbilityRow = Search.prototype.renderAbilityRow;
	Search.renderMoveRow = Search.prototype.renderMoveRow;
	Search.renderMoveRowInner = Search.prototype.renderMoveRowInner;
	Search.renderTaggedMoveRow = Search.prototype.renderTaggedMoveRow;
	Search.renderTypeRow = Search.prototype.renderTypeRow;
	Search.renderCategoryRow = Search.prototype.renderCategoryRow;
	Search.renderEggGroupRow = Search.prototype.renderEggGroupRow;

	exports.BattleSearch = Search;

})(window, jQuery);
