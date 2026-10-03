BattleSearch.urlRoot = Game.root;

Dex.escapeHTML = function (str, jsEscapeToo) {
	str = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	if (jsEscapeToo) str = str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
	return str;
};

function effectLink(type, id, className) {
	var name = type === 'moves' ? Names.move(id) : type === 'abilities' ? Names.ability(id) : Names.item(id);
	return '<a' + (className ? ' class="' + className + '"' : '') + ' href="' + Game.root + type + '/' + id + '" data-target="push">' + Dex.escapeHTML(name) + '</a>';
}
function effectLinks(type, ids, className) {
	var links = ids.map(function (id) {
		return effectLink(type, id, className);
	});
	return links.length > 1 ? links.slice(0, -1).join(', ') + ' y ' + links[links.length - 1] : links.join('');
}

var Topbar = Panels.Topbar.extend({
	height: 51
});

var PokedexResultPanel = Panels.Panel.extend({
	minWidth: 639,
	maxWidth: 639,
	initialize: function() {
		this.html('No encontrado: '+Array.prototype.join.call(arguments,' || '));
	}
});

var PokedexItemPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		id = toID(id);
		var item = Dex.items.get(id);
		this.shortTitle = Names.item(item);

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="'+Game.root+'" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><span class="itemicon" style="'+Dex.getItemIcon(item)+'"></span> <a href="'+Game.root+'items/'+id+'" data-target="push" class="subtle">'+Dex.escapeHTML(Names.item(item))+'</a></h1>';
		buf += '<p>'+Dex.escapeHTML(Names.desc(item))+'</p>';

		var users = [];
		if (item.megaEvolves) users.push(item.megaStone);
		if (item.itemUser) users = users.concat(item.itemUser);
		if (users.length) {
			buf += '<h3>Pok&eacute;mon</h3>';
			buf += '<ul class="utilichart nokbd">';
			for (var i = 0; i < users.length; i++) {
				var pokemon = Dex.species.get(users[i]);
				if (pokemon.exists) buf += BattleSearch.renderPokemonRow(pokemon);
			}
			buf += '</ul>';
		}

		buf += '</div>';

		this.html(buf);
	}
});
var PokedexAbilityPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		id = toID(id);
		var ability = Dex.abilities.get(id);
		this.id = id;
		this.shortTitle = Names.ability(ability);

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="'+Game.root+'" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="'+Game.root+'abilities/'+id+'" data-target="push" class="subtle">'+Dex.escapeHTML(Names.ability(ability))+'</a></h1>';

		buf += '<p>'+Dex.escapeHTML(Names.desc(ability))+'</p>';

		// pokemon
		buf += '<h3>Pok&eacute;mon con esta habilidad</h3>';
		buf += '<ul class="utilichart nokbd">';
		buf += '<li>Cargando...</li>';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderPokemonList.bind(this));
	},
	renderPokemonList: function(list) {
		var ability = Dex.abilities.get(this.id);
		var buf = '';
		for (var pokemonid in BattlePokedex) {
			var template = Dex.species.get(pokemonid);
			if (template.abilities['0'] === ability.name || template.abilities['1'] === ability.name || template.abilities['H'] === ability.name) {
				buf += BattleSearch.renderPokemonRow(template);
			}
		}
		this.$('.utilichart').html(buf);
	}
});
var PokedexTypePanel = PokedexResultPanel.extend({
	initialize: function(id) {
		id = toID(id);
		this.type = id[0].toUpperCase()+id.substr(1);
		var type = Dex.types.get(this.type);
		this.shortTitle = Names.type(this.type);

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="'+Game.root+'" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="'+Game.root+'types/'+id+'" data-target="push" class="subtle">'+Names.type(this.type)+'</a></h1>';
		buf += '<dl>';
		var atLeastOne = false;

		buf += '<dt>Debilidades:</dt> <dd>';
		for (var attackType in type.damageTaken) {
			if (type.damageTaken[attackType] == 1) {
				buf += '<a href="'+Game.root+'types/'+toID(attackType)+'" data-target="push">'+Dex.getTypeIcon(attackType)+'</a> ';
				atLeastOne = true;
			}
		}
		if (!atLeastOne) {
			buf += '<em>Ninguna</em>';
		}
		buf += '</dd>';

		buf += '<dt>Resistencias:</dt> <dd>';
		atLeastOne = false;
		for (var attackType in type.damageTaken) {
			if (type.damageTaken[attackType] == 2) {
				buf += '<a href="'+Game.root+'types/'+toID(attackType)+'" data-target="push">'+Dex.getTypeIcon(attackType)+'</a> ';
				atLeastOne = true;
			}
		}
		if (!atLeastOne) {
			buf += '<em>Ninguna</em>';
		}
		buf += '</dd>';

		buf += '<dt>Inmunidades:</dt> <dd>';
		atLeastOne = false;
		for (var attackType in type.damageTaken) {
			if (type.damageTaken[attackType] == 3) {
				if (attackType === attackType.toLowerCase()) {
					switch (attackType) {
					case 'hail':
						buf += '<div><small>Da&ntilde;o de <a href="'+Game.root+'moves/hail" data-target="push">'+Names.move('hail')+'</a></small></div>';
						break;
					case 'sandstorm':
						buf += '<div><small>Da&ntilde;o de <a href="'+Game.root+'moves/sandstorm" data-target="push">'+Names.move('sandstorm')+'</a></small></div>';
						break;
					case 'powder':
						buf += '<div><small><a href="'+Game.root+'tags/powder" data-target="push">Movimientos de polvo</a></small></div>';
						break;
					case 'frz':
						buf += '<div><small>Congelaci&oacute;n</small></div>';
						break;
					case 'brn':
						buf += '<div><small>Quemaduras</small></div>';
						break;
					case 'psn':
						buf += '<div><small>Envenenamiento</small></div>';
						break;
					case 'par':
						buf += '<div><small>Par&aacute;lisis</small></div>';
						break;
					}
					if (!atLeastOne) atLeastOne = null;
					continue;
				}
				buf += '<a href="'+Game.root+'types/'+toID(attackType)+'" data-target="push">'+Dex.getTypeIcon(attackType)+'</a> ';
				atLeastOne = true;
			}
		}
		if (!atLeastOne) {
			if (atLeastOne === null) {
				buf += '<div><em>Ninguna a tipos</em></div>';
			} else {
				buf += '<em>Ninguna</em>';
			}
		}
		buf += '</dd>';

		buf += '</dl>';

		// move list
		buf += '<ul class="tabbar"><li><button class="button nav-first cur" value="move">Movimientos</button></li><li><button class="button nav-last" value="pokemon">Pok&eacute;mon</button></li></ul>';
		buf += '<ul class="utilichart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderMoveList.bind(this));
	},
	events: {
		'click .tabbar button': 'selectTab'
	},
	selectTab: function(e) {
		this.$('.tabbar button').removeClass('cur');
		$(e.currentTarget).addClass('cur');
		switch (e.currentTarget.value) {
		case 'move':
			this.renderMoveList();
			break;
		case 'pokemon':
			this.renderPokemonList();
			break;
		}
	},
	renderMoveList: function() {
		var type = this.type;
		var typeName = Names.type(type);
		var headers = {
			Physical: 'Movimientos f&iacute;sicos de tipo '+typeName,
			Special: 'Movimientos especiales de tipo '+typeName,
			Status: 'Movimientos de estado de tipo '+typeName
		};
		var bufs = {Physical: '', Special: '', Status: ''};
		for (var moveid in BattleMovedex) {
			var move = Dex.moves.get(moveid);
			if (move.type === type) {
				bufs[move.category] += BattleSearch.renderMoveRow(move);
			}
		}
		var buf = '';
		for (var category in bufs) {
			if (bufs[category]) buf += '<li class="resultheader"><h3>'+headers[category]+'</h3></li>'+bufs[category];
		}
		this.$('.utilichart').html(buf);
	},
	renderPokemonList: function() {
		var type = this.type;
		var typeName = Names.type(type);
		var pureBuf = '';
		var primaryBuf = '';
		var secondaryBuf = '';
		for (var templateid in BattlePokedex) {
			var template = Dex.species.get(templateid);
			if (template.types[0] === type) {
				if (template.types[1]) {
					primaryBuf += BattleSearch.renderPokemonRow(template);
				} else {
					pureBuf += BattleSearch.renderPokemonRow(template);
				}
			} else if (template.types[1] === type) {
				secondaryBuf += BattleSearch.renderPokemonRow(template);
			}
		}
		var buf = '';
		if (pureBuf) buf += '<li class="resultheader"><h3>Pok&eacute;mon de tipo '+typeName+' puro</h3></li>'+pureBuf;
		if (primaryBuf) buf += '<li class="resultheader"><h3>Pok&eacute;mon con '+typeName+' como primer tipo</h3></li>'+primaryBuf;
		if (secondaryBuf) buf += '<li class="resultheader"><h3>Pok&eacute;mon con '+typeName+' como segundo tipo</h3></li>'+secondaryBuf;
		this.$('.utilichart').html(buf);
	}
});
var PokedexTagPanel = PokedexResultPanel.extend({
	table: {
		contact: {
			name: 'Contacto',
			tag: 'contact',
			desc: 'Interact&uacute;a con varios movimientos, habilidades y objetos.</p><p>Movimientos: ' + effectLinks('moves', ['spikyshield', 'kingsshield']) + '. Habilidades: ' + effectLinks('abilities', ['ironbarbs', 'roughskin', 'gooey', 'flamebody', 'static', 'toughclaws']) + '. Objetos: ' + effectLinks('items', ['rockyhelmet', 'stickybarb']) + '.'
		},
		sound: {
			name: 'Sonido',
			tag: 'sound',
			desc: 'Ignora ' + effectLink('moves', 'substitute') + '. No afecta a los Pok&eacute;mon con ' + effectLink('abilities', 'soundproof') + '.'
		},
		powder: {
			name: 'Polvo',
			tag: 'powder',
			desc: 'No afecta a los Pok&eacute;mon de tipo <a href="'+Game.root+'types/grass" data-target="push">' + Names.type('Grass') + '</a>, a los que tienen ' + effectLink('abilities', 'overcoat') + ' ni a los que llevan ' + effectLink('items', 'safetygoggles') + '.'
		},
		fist: {
			name: 'Pu&ntilde;o',
			tag: 'punch',
			desc: 'Potenciados &times;1,2 por ' + effectLink('abilities', 'ironfist') + '.'
		},
		pulse: {
			name: 'Pulso',
			tag: 'pulse',
			desc: 'Potenciados &times;1,5 por ' + effectLink('abilities', 'megalauncher') + '.'
		},
		bite: {
			name: 'Mordisco',
			tag: 'bite',
			desc: 'Potenciados &times;1,5 por ' + effectLink('abilities', 'strongjaw') + '.'
		},
		ballistic: {
			name: 'Bal&iacute;stico',
			tag: 'bullet',
			desc: 'No afectan a los Pok&eacute;mon con ' + effectLink('abilities', 'bulletproof') + '.'
		},
		slicing: {
			name: 'Corte',
			tag: 'slicing',
			desc: 'Potenciados &times;1,5 por ' + effectLink('abilities', 'sharpness') + '.'
		},
		wind: {
			name: 'Viento',
			tag: 'wind',
			desc: 'Los Pok&eacute;mon con ' + effectLink('abilities', 'windpower') + ' se cargan al recibirlos. Los Pok&eacute;mon con ' + effectLink('abilities', 'windrider') + ' son inmunes y suben un nivel su Ataque.'
		},
		bypassprotect: {
			name: 'Ignora Protecci&oacute;n',
			tag: '',
			desc: 'Ignora ' + effectLinks('moves', ['protect', 'detect', 'kingsshield', 'spikyshield'], 'subtle') + '.'
		},
		nonreflectable: {
			name: 'No reflejable',
			tag: '',
			desc: 'No lo devuelven ' + effectLink('moves', 'magiccoat', 'subtle') + ' ni ' + effectLink('abilities', 'magicbounce', 'subtle') + '.'
		},
		nonmirror: {
			name: 'No copiable',
			tag: '',
			desc: effectLink('moves', 'mirrormove', 'subtle') + ' no puede copiarlo.'
		},
		nonsnatchable: {
			name: 'No robable',
			tag: '',
			desc: effectLink('moves', 'snatch', 'subtle') + ' no puede robarlo.'
		},
		bypasssub: {
			name: 'Ignora Sustituto',
			tag: 'bypasssub',
			desc: 'Atraviesa un ' + effectLink('moves', 'substitute', 'subtle') + ' sin romperlo.'
		}
	},
	initialize: function(id) {
		id = toID(id);
		var tag = this.table[id];
		var name = (tag ? tag.name : id);
		this.id = id;
		this.shortTitle = name;

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="'+Game.root+'" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="'+Game.root+'tags/'+id+'" data-target="push" class="subtle">'+name+'</a></h1>';

		if (tag) buf += '<p>'+tag.desc+'</p>';

		// distribution
		buf += '<h3>Movimientos</h3>';
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderDistribution.bind(this));
	},
	getDistribution: function() {
		if (this.results) return this.results;
		var tag = (this.id in this.table ? this.table[this.id].tag : this.id);
		var results = [];
		if (tag) {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].flags && tag in BattleMovedex[moveid].flags) results.push(moveid);
			}
		} else if (this.id === 'bypassprotect') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].target !== 'self' && BattleMovedex[moveid].flags && !('protect' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'nonreflectable') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].target !== 'self' && BattleMovedex[moveid].category === 'Status' && BattleMovedex[moveid].flags && !('reflectable' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'nonmirror') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].target !== 'self' && BattleMovedex[moveid].flags && !('mirror' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'nonsnatchable') {
			for (var moveid in BattleMovedex) {
				if ((BattleMovedex[moveid].target === 'allyTeam' || BattleMovedex[moveid].target === 'self' || BattleMovedex[moveid].target === 'adjacentAllyOrSelf') && BattleMovedex[moveid].flags && !('snatch' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		}
		return this.results = results;
	},
	renderDistribution: function() {
		var results = this.getDistribution();
		this.$chart = this.$('.utilichart');

		if (results.length > 1600/33) {
			this.streamLoading = true;
			this.$el.on('scroll', this.handleScroll.bind(this));

			var panelTop = this.$el.children().offset().top;
			var panelHeight = this.$el.outerHeight();
			var chartTop = this.$chart.offset().top;
			var scrollLoc = this.scrollLoc = this.$el.scrollTop();

			var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
			var end = Math.floor(start + 35 + panelHeight / 33 + 35);
			if (start < 0) start = 0;
			if (end > results.length-1) end = results.length-1;
			this.start = start, this.end = end;

			// distribution
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, i < start || i > end)+'</li>';
			}
			this.$chart.html(buf);
		} else {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i)+'</li>';
			}
			this.$chart.html(buf);
		}
	},
	renderRow: function(i, offscreen) {
		var results = this.results;
		var move = Dex.moves.get(results[i]);
		if (offscreen) {
			return Names.move(move);
		} else {
			return BattleSearch.renderMoveRowInner(move);
		}
	},
	handleScroll: function() {
		var scrollLoc = this.$el.scrollTop();
		if (Math.abs(scrollLoc - this.scrollLoc) > 20*33) {
			this.renderUpdateDistribution();
		}
	},
	debouncedPurgeTimer: null,
	renderUpdateDistribution: function(fullUpdate) {
		if (this.debouncedPurgeTimer) {
			clearTimeout(this.debouncedPurgeTimer);
			this.debouncedPurgeTimer = null;
		}

		var panelTop = this.$el.children().offset().top;
		var panelHeight = this.$el.outerHeight();
		var chartTop = this.$chart.offset().top;
		var scrollLoc = this.scrollLoc = this.$el.scrollTop();

		var results = this.results;

		var rowFit = Math.floor(panelHeight / 33);

		var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
		var end = start + 35 + rowFit + 35;
		if (start < 0) start = 0;
		if (end > results.length-1) end = results.length-1;

		var $rows = this.$chart.children();

		if (fullUpdate || start < this.start - rowFit - 30 || end > this.end + rowFit + 30) {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, (i < start || i > end))+'</li>';
			}
			this.$chart.html(buf);
			this.start = start, this.end = end;
			return;
		}

		if (start < this.start) {
			for (var i = start; i<this.start; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.start = start;
		}

		if (end > this.end) {
			for (var i = this.end+1; i<=end; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.end = end;
		}

		if (this.end - this.start > rowFit+90) {
			var self = this;
			this.debouncedPurgeTimer = setTimeout(function() {
				self.renderUpdateDistribution(true);
			}, 1000);
		}
	}
});
var PokedexEggGroupPanel = PokedexResultPanel.extend({
	table: {
		amorphous: 'Amorphous',
		bug: 'Bug',
		ditto: 'Ditto',
		dragon: 'Dragon',
		fairy: 'Fairy',
		field: 'Field',
		flying: 'Flying',
		grass: 'Grass',
		humanlike: 'Human-Like',
		mineral: 'Mineral',
		monster: 'Monster',
		undiscovered: 'Undiscovered',
		water1: 'Water 1',
		water2: 'Water 2',
		water3: 'Water 3'
	},
	descs: {
		ditto: "Puede criar con casi cualquier Pok&eacute;mon.",
		undiscovered: "No puede criar."
	},
	initialize: function(id) {
		var ids = id.split('+');
		for (var i = 0; i < ids.length; i++) ids[i] = toID(ids[i]);
		this.id = ids[0];
		var names = Names.eggGroup(this.table[ids[0]]);
		this.shortTitle = names;
		if (ids[1]) {
			this.id2 = ids[1];
			names += ' + '+Names.eggGroup(this.table[ids[1]]);
			this.shortTitle = "Grupos huevo";
		}

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="'+Game.root+'" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="'+Game.root+'egggroups/'+id+'" data-target="push" class="subtle">'+names+'</a></h1>';

		if (this.id2) {
			buf += '<p>Todos los Pok&eacute;mon de los grupos huevo <a href="'+Game.root+'egggroups/'+this.id+'" data-target="push">'+Names.eggGroup(this.table[ids[0]])+'</a> o <a href="'+Game.root+'egggroups/'+this.id2+'" data-target="push">'+Names.eggGroup(this.table[ids[1]])+'</a>.</p>';
		} else if (this.descs[ids[0]]) {
			buf += '<p>'+this.descs[ids[0]]+'</p>';
		}

		// distribution
		buf += '<h3>Pok&eacute;mon</h3>';
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderDistribution.bind(this));
	},
	getDistribution: function() {
		var name = this.table[this.id];
		var name2 = '!';
		if (this.id2) name2 = this.table[this.id2];
		if (this.results) return this.results;
		var results = [];
		for (var pokemonid in BattlePokedex) {
			var pokemon = Dex.species.get(pokemonid);
			var eggGroups = pokemon.eggGroups;
			if (!eggGroups || pokemon.forme) continue;
			if (eggGroups[0] === name || eggGroups[1] === name ||
				eggGroups[0] === name2 || eggGroups[1] === name2) {
				results.push(pokemonid);
			}
		}
		return this.results = results;
	},
	renderDistribution: function() {
		var results = this.getDistribution();
		this.$chart = this.$('.utilichart');

		if (results.length > 1600/33) {
			this.streamLoading = true;
			this.$el.on('scroll', this.handleScroll.bind(this));

			var panelTop = this.$el.children().offset().top;
			var panelHeight = this.$el.outerHeight();
			var chartTop = this.$chart.offset().top;
			var scrollLoc = this.scrollLoc = this.$el.scrollTop();

			var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
			var end = Math.floor(start + 35 + panelHeight / 33 + 35);
			if (start < 0) start = 0;
			if (end > results.length-1) end = results.length-1;
			this.start = start, this.end = end;

			// distribution
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, i < start || i > end)+'</li>';
			}
			this.$chart.html(buf);
		} else {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i)+'</li>';
			}
			this.$chart.html(buf);
		}
	},
	renderRow: function(i, offscreen) {
		var results = this.results;
		var template = Dex.species.get(results[i]);
		if (offscreen) {
			return Names.species(template);
		} else {
			return BattleSearch.renderTaggedPokemonRowInner(template, '<span class="picon" style="margin-top:-12px;'+Dex.getPokemonIcon('egg')+'"></span>');
		}
	},
	handleScroll: function() {
		var scrollLoc = this.$el.scrollTop();
		if (Math.abs(scrollLoc - this.scrollLoc) > 20*33) {
			this.renderUpdateDistribution();
		}
	},
	debouncedPurgeTimer: null,
	renderUpdateDistribution: function(fullUpdate) {
		if (this.debouncedPurgeTimer) {
			clearTimeout(this.debouncedPurgeTimer);
			this.debouncedPurgeTimer = null;
		}

		var panelTop = this.$el.children().offset().top;
		var panelHeight = this.$el.outerHeight();
		var chartTop = this.$chart.offset().top;
		var scrollLoc = this.scrollLoc = this.$el.scrollTop();

		var results = this.results;

		var rowFit = Math.floor(panelHeight / 33);

		var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
		var end = start + 35 + rowFit + 35;
		if (start < 0) start = 0;
		if (end > results.length-1) end = results.length-1;

		var $rows = this.$chart.children();

		if (fullUpdate || start < this.start - rowFit - 30 || end > this.end + rowFit + 30) {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, (i < start || i > end))+'</li>';
			}
			this.$chart.html(buf);
			this.start = start, this.end = end;
			return;
		}

		if (start < this.start) {
			for (var i = start; i<this.start; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.start = start;
		}

		if (end > this.end) {
			for (var i = this.end+1; i<=end; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.end = end;
		}

		if (this.end - this.start > rowFit+90) {
			var self = this;
			this.debouncedPurgeTimer = setTimeout(function() {
				self.renderUpdateDistribution(true);
			}, 1000);
		}
	}
});
var PokedexCategoryPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		id = toID(id);
		var name = Names.category(id);
		this.shortTitle = name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="'+Game.root+'" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="'+Game.root+'categories/'+id+'" data-target="push" class="subtle">'+name+'</a></h1>';
		switch (id) {
		case 'physical':
			buf += '<p>Los movimientos f&iacute;sicos hacen da&ntilde;o que normalmente depende del Ataque del usuario y de la Defensa del objetivo.</p>';
			break;
		case 'special':
			buf += '<p>Los movimientos especiales hacen da&ntilde;o que normalmente depende del Ataque Especial del usuario y de la Defensa Especial del objetivo.</p>';
			break;
		case 'status':
			buf += '<p>Los movimientos de estado no hacen da&ntilde;o directamente.</p>';
			break;
		}
		buf += '</div>';

		this.html(buf);
	}
});
