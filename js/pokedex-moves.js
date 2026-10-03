function sourcePad(source) {
	var level = source.slice(2);
	if (level.length < 3) level = '0' + level;
	if (level.length < 3) level = '0' + level;
	return level.length > 3 ? level : level+' ';
}

var PokedexMovePanel = PokedexResultPanel.extend({
	initialize: function(id) {
		id = toID(id);
		var move = Dex.moves.get(id);
		this.id = id;
		this.shortTitle = Names.move(move);

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/moves/'+id+'" data-target="push" class="subtle">'+Dex.escapeHTML(Names.move(move))+'</a></h1>';

		buf += '<dl class="movetypeentry">';
		buf += '<dt>Tipo:</dt> <dd>';
		buf += '<a class="type '+toID(move.type)+'" href="/types/'+toID(move.type)+'" data-target="push">'+Names.type(move.type)+'</a> ';
		buf += '<a class="type '+toID(move.category)+'" href="/categories/'+toID(move.category)+'" data-target="push">'+Names.category(move.category)+'</a>';
		buf += '</dd></dl>';

		if (move.category !== 'Status') {
			buf += '<dl class="powerentry"><dt>Potencia:</dt> <dd><strong>'+(move.basePower||'&mdash;')+'</strong></dd></dl>';
		}
		buf += '<dl class="accuracyentry"><dt>Precisi&oacute;n:</dt> <dd>'+(move.accuracy && move.accuracy!==true?move.accuracy+'%':'&mdash;')+'</dd></dl>';
		buf += '<dl class="ppentry"><dt>PP:</dt> <dd>'+(move.pp)+(move.pp>1 ? ' <small class="minor">(m&aacute;x.: '+(8/5*move.pp)+')</small>' : '')+'</dd>';
		buf += '</dl><div style="clear:left;padding-top:1px"></div>';

		if (move.priority > 1) {
			buf += '<p>Casi siempre ataca primero <em>(prioridad +' + move.priority + ')</em>.</p>';
		} else if (move.priority <= -1) {
			buf += '<p>Casi siempre ataca el &uacute;ltimo <em>(prioridad &minus;' + (-move.priority) + ')</em>.</p>';
		} else if (move.priority === 1) {
			buf += '<p>Normalmente ataca primero <em>(prioridad +' + move.priority + ')</em>.</p>';
		}

		buf += '<p>'+Dex.escapeHTML(Names.desc(move))+'</p>';

		if ('defrost' in move.flags) {
			buf += '<p>Si el usuario est&aacute; congelado, se descongela.</p>';
		}
		if (!('protect' in move.flags) && move.target !== 'self') {
			buf += '<p class="movetag"><a href="/tags/bypassprotect" data-target="push">Ignora Protecci&oacute;n</a> <small>(ignora ' + effectLinks('moves', ['protect', 'detect', 'kingsshield', 'spikyshield'], 'subtle') + ')</small></p>';
		}
		if ('bypasssub' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/bypasssub" data-target="push">Ignora Sustituto</a> <small>(atraviesa un ' + effectLink('moves', 'substitute', 'subtle') + ' sin romperlo)</small></p>';
		}
		if (!('reflectable' in move.flags) && move.target !== 'self' && move.category === 'Status') {
			buf += '<p class="movetag"><a href="/tags/nonreflectable" data-target="push">&#x2713; No reflejable</a> <small>(no lo devuelven ' + effectLink('moves', 'magiccoat', 'subtle') + ' ni ' + effectLink('abilities', 'magicbounce', 'subtle') + ')</small></p>';
		}
		if (!('mirror' in move.flags) && move.target !== 'self') {
			buf += '<p class="movetag"><a href="/tags/nonmirror" data-target="push">&#x2713; No copiable</a> <small>(' + effectLink('moves', 'mirrormove', 'subtle') + ' no puede copiarlo)</small></p>';
		}
		if (!('snatch' in move.flags) && (move.target === 'self' || move.target === 'allyTeam' || move.target === 'adjacentAllyOrSelf')) {
			buf += '<p class="movetag"><a href="/tags/nonsnatchable" data-target="push">&#x2713; No robable</a> <small>(' + effectLink('moves', 'snatch', 'subtle') + ' no puede robarlo)</small></p>';
		}

		if ('contact' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/contact" data-target="push">&#x2713; Contacto</a> <small>(interact&uacute;a con habilidades como ' + effectLink('abilities', 'ironbarbs', 'subtle') + ' y movimientos como ' + effectLink('moves', 'spikyshield', 'subtle') + ')</small></p>';
		}
		if ('sound' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/sound" data-target="push">&#x2713; Sonido</a> <small>(ignora ' + effectLink('moves', 'substitute', 'subtle') + ', no afecta a los Pok&eacute;mon con ' + effectLink('abilities', 'soundproof', 'subtle') + ')</small></p>';
		}
		if ('powder' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/powder" data-target="push">&#x2713; Polvo</a> <small>(no afecta al tipo <a class="subtle" href="/types/grass" data-target="push">' + Names.type('Grass') + '</a>, a los Pok&eacute;mon con ' + effectLink('abilities', 'overcoat', 'subtle') + ' ni a los que llevan ' + effectLink('items', 'safetygoggles', 'subtle') + ')</small></p>';
		}
		if ('punch' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/fist" data-target="push">&#x2713; Pu&ntilde;o</a> <small>(lo potencia ' + effectLink('abilities', 'ironfist', 'subtle') + ')</small></p>';
		}
		if ('pulse' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/pulse" data-target="push">&#x2713; Pulso</a> <small>(lo potencia ' + effectLink('abilities', 'megalauncher', 'subtle') + ')</small></p>';
		}
		if ('bite' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/bite" data-target="push">&#x2713; Mordisco</a> <small>(lo potencia ' + effectLink('abilities', 'strongjaw', 'subtle') + ')</small></p>';
		}
		if ('bullet' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/ballistic" data-target="push">&#x2713; Bal&iacute;stico</a> <small>(no afecta a los Pok&eacute;mon con ' + effectLink('abilities', 'bulletproof', 'subtle') + ')</small></p>';
		}
		if ('slicing' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/slicing" data-target="push">&#x2713; Corte</a> <small>(lo potencia ' + effectLink('abilities', 'sharpness', 'subtle') + ')</small></p>';
		}
		if ('wind' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/wind" data-target="push">&#x2713; Viento</a> <small>(interact&uacute;a con ' + effectLink('abilities', 'windpower', 'subtle') + ' y ' + effectLink('abilities', 'windrider', 'subtle') + ')</small></p>';
		}

		if (move.target === 'allAdjacent') {
			buf += '<p class="movetag"><small>En combates dobles, alcanza a todos los Pok&eacute;mon adyacentes (aliados incluidos)</small></p>';
		} else if (move.target === 'allAdjacentFoes') {
			buf += '<p class="movetag"><small>En combates dobles, alcanza a todos los rivales adyacentes</small></p>';
		} else if (move.target === 'randomNormal') {
			buf += '<p class="movetag"><small>En combates dobles, alcanza a un rival al azar (no se puede elegir el objetivo)</small></p>';
		} else if (move.target === 'adjacentAllyOrSelf') {
			buf += '<p class="movetag"><small>En combates dobles, puede usarse sobre el usuario o un aliado adyacente</small></p>';
		}

		// getting it
		// warning: excessive trickiness
		var leftPanel = this.app.panels[this.app.panels.length - 2];
		if (leftPanel && leftPanel.fragment.slice(0, 8) === 'pokemon/') {
			var pokemon = Dex.species.get(leftPanel.id);
			var getLearnset = PokedexPokemonPanel.prototype.getLearnset;
			var eg1 = pokemon.eggGroups[0];
			var eg2 = pokemon.eggGroups[1];
			var sources = getLearnset(pokemon.id)[id];
			var template = null;
			var atLeastOne = false;
			while (true) {
				if (!template) {
					template = pokemon;
				} else {
					if (!template.prevo) break;
					template = Dex.species.get(template.prevo);
					sources = getLearnset(template.id)[id];
				}

				if (!sources) continue;

				if (!atLeastOne) {
					buf += '<h3>C&oacute;mo lo aprende ' + Dex.escapeHTML(Names.species(pokemon)) + '</h3><ul>';
					atLeastOne = true;
				}

				if (template.id !== pokemon.id) {
					buf += '</ul><p>Como ' + Dex.escapeHTML(Names.species(template)) + ':</p><ul>';
				}

				if (typeof sources === 'string') sources = [sources];
				for (var i=0, len=sources.length; i<len; i++) {
					var source = sources[i];
					switch (source.charAt(1)) {
					case 'L':
						buf += '<li>Nivel ' + parseInt(source.slice(2, 5), 10) + '</li>';
						break;
					case 'M':
						buf += '<li>MT o tutor</li>';
						break;
					case 'T':
						buf += '<li>Tutor</li>';
						break;
					case 'E':
						buf += '<li>Movimiento huevo: criando con ';
						var hasBreeders = false;
						for (var breederid in BattleLearnsets) {
							if (!BattleLearnsets[breederid].learnset || !BattleLearnsets[breederid].learnset[id]) continue;
							var breeder = Dex.species.get(breederid);
							if (!breeder.exists || !breeder.eggGroups) continue;
							if (breeder.gender && breeder.gender !== 'M') continue;
							if (breederid === pokemon.id || breederid === template.id || breederid === toID(pokemon.prevo)) continue;
							if (eg1 === breeder.eggGroups[0] || eg1 === breeder.eggGroups[1] ||
								(eg2 && (eg2 === breeder.eggGroups[0] || eg2 === breeder.eggGroups[1]))) {
								if (hasBreeders) buf += ', ';
								buf += '<a href="/pokemon/' + breederid + '" data-target="push">' + Dex.escapeHTML(Names.species(breeder)) + '</a>';
								hasBreeders = true;
							}
						}
						if (!hasBreeders) buf += 'su misma especie';
						buf += '</li>';
						break;
					case 'S':
						buf += '<li>Evento</li>';
						break;
					case 'R':
						buf += '<li>Al cambiar de forma</li>';
						break;
					}
				}
			}
			if (atLeastOne) buf += '</ul>';
		}

		// distribution
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderDistribution.bind(this));
	},
	getDistribution: function() {
		var moveid = this.id;
		if (this.results) return this.results;
		var results = [];
		for (var pokemonid in BattleLearnsets) {
			var pokemon = Dex.species.get(pokemonid);
			if (!pokemon.exists || !BattleLearnsets[pokemonid].learnset) continue;
			var sources = BattleLearnsets[pokemonid].learnset[moveid];
			if (!sources) continue;
			if (typeof sources === 'string') sources = [sources];
			var atLeastOne = false;
			for (var i=0, len=sources.length; i<len; i++) {
				var source = sources[i];
				switch (source.charAt(1)) {
				case 'L':
					results.push('a'+sourcePad(source)+pokemonid);
					atLeastOne = true;
					break;
				case 'M':
					results.push('b000 '+pokemonid);
					atLeastOne = true;
					break;
				case 'T':
					results.push('c000 '+pokemonid);
					atLeastOne = true;
					break;
				case 'E':
					results.push('d000 '+pokemonid);
					atLeastOne = true;
					break;
				case 'S':
					if (atLeastOne === 'S') break;
					results.push('e000 '+pokemonid);
					atLeastOne = 'S';
					break;
				}
			}
			if (!atLeastOne) {
				results.push('f000 '+pokemonid);
			}
		}
		results.sort();
		var last = '';
		for (var i=0; i<results.length; i++) {
			if (results[i].charAt(0) !== last) {
				results.splice(i, 0, results[i].charAt(0).toUpperCase());
				i++;
			}
			last = results[i].charAt(0);
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
		var id = results[i].substr(5);
		var template = id ? Dex.species.get(id) : undefined;
		if (!template) {
			switch (results[i].charAt(0)) {
			case 'A': // level-up move
				return '<h3>Por nivel</h3>';
			case 'B': // tm
				return '<h3>MT y tutores</h3>';
			case 'C': // tutor
				return '<h3>Tutor</h3>';
			case 'D': // egg move
				return '<h3>Huevo</h3>';
			case 'E': // event
				return '<h3>Evento</h3>';
			case 'F': // forme change
				return '<h3>Al cambiar de forma</h3>';
			}
			return '<pre>error: "'+results[i]+'"</pre>';
		} else if (offscreen) {
			return Dex.escapeHTML(Names.species(template));
		} else {
			var desc = '';
			switch (results[i].charAt(0)) {
			case 'a': // level-up move
				desc = results[i].substr(1,3) === '001' || results[i].substr(1,3) === '000' ? '&ndash;' : '<small>N.</small>'+(parseInt(results[i].substr(1,3), 10) || '?');
				break;
			case 'b': // tm
				desc = '<img src="' + Dex.resourcePrefix + 'sprites/itemicons/tm-normal.png" style="margin-top:-3px;opacity:.7" width="24" height="24" alt="M" />';
				break;
			case 'c': // tutor
				desc = '<img src="' + Dex.resourcePrefix + 'sprites/tutor.png" style="margin-top:-4px;opacity:.7" width="27" height="26" alt="T" />';
				break;
			case 'd': // egg move
				desc = '<span class="picon" style="margin-top:-12px;'+Dex.getPokemonIcon('egg')+'"></span>';
				break;
			case 'e': // event
				desc = '!';
				break;
			case 'f': // forme change
				desc = '&ndash;';
				break;
			}
			return BattleSearch.renderTaggedPokemonRowInner(template, desc);
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
