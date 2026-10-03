var PokedexPokemonPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		id = toID(id);
		var pokemon = Dex.species.get(id);
		var gameData = window.AnilGameSpecies && AnilGameSpecies[id];
		this.id = id;
		this.shortTitle = Names.species(pokemon.baseSpecies);

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1>';
		buf += '<a href="/pokemon/'+id+'" data-target="push" class="subtle">'+Names.speciesHTML(pokemon)+'</a>';
		if (pokemon.num > 0) buf += ' <code>#'+pokemon.num+'</code>';
		buf += '</h1>';

		buf += '<img src="'+Dex.resourcePrefix+'sprites/gen5/' + pokemon.spriteid + '.png'+'" alt="" width="96" height="96" class="sprite" />';

		buf += '<dl class="typeentry">';
		buf += '<dt>Tipos:</dt> <dd>';
		for (var i=0; i<pokemon.types.length; i++) {
			buf += '<a class="type '+toID(pokemon.types[i])+'" href="/types/'+toID(pokemon.types[i])+'" data-target="push">'+Names.type(pokemon.types[i])+'</a> ';
		}
		buf += '</dd>';
		buf += '</dl>';

		buf += '<dl class="sizeentry">';
		buf += '<dt>Tama&ntilde;o:</dt> <dd>';
		var gkPower = (function(weightkg) {
			if (weightkg >= 200) return 120;
			if (weightkg >= 100) return 100;
			if (weightkg >= 50) return 80;
			if (weightkg >= 25) return 60;
			if (weightkg >= 10) return 40;
			return 20;
		})(pokemon.weightkg);
		buf += ''+pokemon.heightm+' m, '+pokemon.weightkg+' kg<br /><small><a class="subtle" href="/moves/grassknot" data-target="push">'+Names.move('grassknot')+'</a>: '+gkPower+'</small>';
		buf += '</dd>';
		buf += '</dl>';

		buf += '<dl class="abilityentry">';
		buf += '<dt>Habilidades:</dt> <dd class="imgentry">';
		for (var i in pokemon.abilities) {
			var ability = pokemon.abilities[i];
			if (!ability) continue;

			if (i !== '0') buf += ' | ';
			var abilityName = Dex.escapeHTML(Names.ability(ability));
			if (i === 'H') abilityName = '<em>'+abilityName+'</em>';
			buf += '<a href="/abilities/'+toID(ability)+'" data-target="push">'+abilityName+'</a>';
			if (i === 'H') buf += '<small> (oculta)</small>';
			if (i === 'S') buf += '<small> (especial)</small>';
		}
		buf += '</dd>';
		buf += '</dl>';

		buf += '<dl>';
		buf += '<dt style="clear:left">Estad&iacute;sticas base:</dt><dd><table class="stats">';

		buf += '<tr><td></td><td></td><td style="width:200px"></td><th class="ministat"><abbr title="0 IV, 0 EV, naturaleza desfavorable">m&iacute;n&minus;</abbr></th><th class="ministat"><abbr title="31 IV, 0 EV, naturaleza neutra">m&iacute;n</abbr></th><th class="ministat"><abbr title="31 IV, 252 EV, naturaleza neutra">m&aacute;x</abbr></th><th class="ministat"><abbr title="31 IV, 252 EV, naturaleza favorable">m&aacute;x+</abbr></th>';
		var bst = 0;
		for (var stat in BattleStatNames) {
			var baseStat = pokemon.baseStats[stat];
			bst += baseStat;
			var width = Math.floor(baseStat*200/200);
			if (width > 200) width = 200;
			var color = Math.floor(baseStat*180/255);
			if (color > 360) color = 360;
			buf += '<tr><th>'+TL.statMedium[stat]+':</th><td class="stat">'+baseStat+'</td>';
			buf += '<td class="statbar"><span style="width:'+Math.floor(width)+'px;background:hsl('+color+',85%,45%);border-color:hsl('+color+',75%,35%)"></span></td>';
			buf += '<td class="ministat"><small>'+(stat==='hp'?'':this.getStat(baseStat, false, 100, 0, 0, 0.9))+'</small></td><td class="ministat"><small>'+this.getStat(baseStat, stat==='hp', 100, 31, 0, 1.0)+'</small></td>';
			buf += '<td class="ministat"><small>'+this.getStat(baseStat, stat==='hp', 100, 31, 255, 1.0)+'</small></td><td class="ministat"><small>'+(stat==='hp'?'':this.getStat(baseStat, false, 100, 31, 255, 1.1))+'</small></td></tr>';
		}
		buf += '<tr><th class="bst">Total:</th><td class="bst">'+bst+'</td><td></td><td class="ministat" colspan="4">a nivel <input type="text" class="textbox" name="level" placeholder="100" size="5" /></td>';

		buf += '</table></dd>';

		buf += '<dt>Evoluci&oacute;n:</dt> <dd>';
		var basic = pokemon;
		while (basic.prevo) basic = Dex.species.get(basic.prevo);
		if (basic.evos) {
			buf += '<table class="evos"><tr><td>';
			var column = [basic];
			while (column.length) {
				if (column[0] !== basic) {
					buf += '</td><td class="arrow"><span>'+(column.length > 1 ? '&rarr;<br />&rarr;' : '&rarr;')+'</span></td><td>';
				}
				var next = [];
				for (var i=0; i<column.length; i++) {
					var template = column[i];
					var name = '<span class="picon" style="'+Dex.getPokemonIcon(template)+'"></span>'+Names.speciesHTML(template);
					if (template === pokemon) {
						buf += '<div><strong>'+name+'</strong></div>';
					} else {
						buf += '<div><a href="/pokemon/'+template.id+'" data-target="replace">'+name+'</a></div>';
					}
					for (var j=0; j<(template.evos || []).length; j++) {
						var evo = Dex.species.get(template.evos[j]);
						if (evo.exists) next.push(evo);
					}
				}
				column = next;
			}
			buf += '</td></tr></table>';
			if (gameData && gameData.evo && pokemon.prevo) {
				buf += '<div><small>'+Dex.escapeHTML(gameData.evo)+'</small></div>';
			}
		} else {
			buf += '<em>No evoluciona</em>';
		}

		if (pokemon.otherFormes || pokemon.forme) {
			buf += '</dd><dt>Formas:</dt> <dd>';
			template = (pokemon.forme ? Dex.species.get(pokemon.baseSpecies) : pokemon);
			var name = '<span class="picon" style="'+Dex.getPokemonIcon(template)+'"></span>'+Dex.escapeHTML(Names.species(template));
			if (template === pokemon) {
				buf += '<strong>'+name+'</strong>';
			} else {
				buf += '<a href="/pokemon/'+template.id+'" data-target="replace">'+name+'</a>';
			}
			var otherFormes = template.otherFormes;
			if (otherFormes) for (var i=0; i<otherFormes.length; i++) {
				template = Dex.species.get(otherFormes[i]);
				if (!template.exists) continue;
				var name = '<span class="picon" style="'+Dex.getPokemonIcon(template)+'"></span>'+Dex.escapeHTML(Names.forme(template));
				if (template === pokemon) {
					buf += ', <strong>'+name+'</strong>';
				} else {
					buf += ', <a href="/pokemon/'+template.id+'" data-target="replace">'+name+'</a>';
				}
			}
			if (pokemon.requiredItem) {
				buf += '<div><small>Debe llevar '+effectLink('items', toID(pokemon.requiredItem))+'</small></div>';
			}
		}
		if (pokemon.cosmeticFormes) {
			buf += '</dd><dt>Formas est&eacute;ticas:</dt> <dd>';
			var name = '<span class="picon" style="'+Dex.getPokemonIcon(pokemon)+'"></span>'+Dex.escapeHTML(Names.species(pokemon));
			buf += ''+name;

			for (var i=0; i<pokemon.cosmeticFormes.length; i++) {
				template = Dex.species.get(pokemon.cosmeticFormes[i]);
				var name = '<span class="picon" style="'+Dex.getPokemonIcon(template)+'"></span>'+Dex.escapeHTML(Names.forme(template));
				buf += ', '+name;
			}
		}
		buf += '</dd></dl>';

		if (pokemon.eggGroups) {
			buf += '<dl class="colentry"><dt>Grupos huevo:</dt><dd><span class="picon" style="margin-top:-12px;'+Dex.getPokemonIcon('egg')+'"></span><a href="/egggroups/'+pokemon.eggGroups.map(toID).join('+')+'" data-target="push">'+pokemon.eggGroups.map(Names.eggGroup).join(', ')+'</a></dd></dl>';
			buf += '<dl class="colentry"><dt>Sexo:</dt><dd>';
			if (pokemon.gender) switch (pokemon.gender) {
			case 'M':
				buf += '100% macho';
				break;
			case 'F':
				buf += '100% hembra';
				break;
			case 'N':
				buf += 'Sin sexo';
				break;
			} else if (pokemon.genderRatio) {
				buf += ''+(pokemon.genderRatio.M*100)+'% macho, '+(pokemon.genderRatio.F*100)+'% hembra';
			} else {
				buf += '50% macho, 50% hembra';
			}
			buf += '</dd></dl>';
			buf += '<div style="clear:left"></div>';
		}

		if (gameData && gameData.entry) {
			buf += '<p class="dexentrytext"><strong>Pok&eacute;mon '+Dex.escapeHTML(gameData.category)+'.</strong> '+Dex.escapeHTML(gameData.entry)+'</p>';
		}

		// learnset
		buf += '<ul class="tabbar"><li><button class="button nav-first cur" value="move">Movimientos</button></li><li><button class="button nav-last" value="details">Detalles</button></li></ul>';
		buf += '<ul class="utilichart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderFullLearnset.bind(this));
	},
	events: {
		'click .tabbar button': 'selectTab',
		'input input[name=level]': 'updateLevel',
		'keyup input[name=level]': 'updateLevel',
		'change input[name=level]': 'updateLevel',
	},
	updateLevel: function(e) {
		var val = this.$('input[name=level]').val();
		var level = val === '' ? 100 : parseInt(val, 10);
		var lowIV = 31, highIV = 31;
		var lowEV = 0, highEV = 255;
		if (val.slice(-1) === ':') {
			lowIV = 0;
			highEV = 0;
		}
		var i = 0;
		var $entries = this.$('table.stats td.ministat small');
		var pokemon = Dex.species.get(this.id);
		for (var stat in BattleStatNames) {
			var baseStat = pokemon.baseStats[stat];

			$entries.eq(4 * i + 0).text(stat==='hp'?'':this.getStat(baseStat, false, level, 0, 0, 0.9));
			$entries.eq(4 * i + 1).text(this.getStat(baseStat, stat==='hp', level, lowIV, lowEV, 1.0));
			$entries.eq(4 * i + 2).text(this.getStat(baseStat, stat==='hp', level, highIV, highEV, 1.0));
			$entries.eq(4 * i + 3).text(stat==='hp'?'':this.getStat(baseStat, false, level, highIV, highEV, 1.1));
			i++;
		}
	},
	selectTab: function(e) {
		this.$('.tabbar button').removeClass('cur');
		$(e.currentTarget).addClass('cur');
		switch (e.currentTarget.value) {
		case 'move':
			this.renderFullLearnset();
			break;
		case 'details':
			this.renderDetails();
			break;
		}
	},
	getLearnset: function(id) {
		var species = Dex.species.get(id);
		var learnset = BattleLearnsets[species.id] && BattleLearnsets[species.id].learnset;
		if (!learnset && BattleLearnsets[toID(species.baseSpecies)]) {
			learnset = BattleLearnsets[toID(species.baseSpecies)].learnset;
		}
		if (species.changesFrom && BattleLearnsets[toID(species.changesFrom)]) {
			learnset = $.extend({}, learnset, BattleLearnsets[toID(species.changesFrom)].learnset);
		}
		return learnset || {};
	},
	renderFullLearnset: function() {
		var pokemon = Dex.species.get(this.id);
		var learnset = this.getLearnset(this.id);

		// learnset
		var buf = '';
		var moves = [];
		var shownMoves = {};
		for (var moveid in learnset) {
			var sources = learnset[moveid];
			if (typeof sources === 'string') sources = [sources];
			for (var i=0, len=sources.length; i<len; i++) {
				var source = sources[i];
				var sourceType = source.charAt(1);
				switch (sourceType) {
				case 'L':
					moves.push('a'+source.substr(2).padStart(3,'0')+' '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|2);
					break;
				case 'M':
					moves.push('d000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|1);
					break;
				case 'T':
					moves.push('e000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|1);
					break;
				case 'E':
					moves.push('f000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|4);
					break;
				case 'S':
					if (shownMoves[moveid]&8) continue;
					moves.push('i000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|8);
					break;
				}
			}
		}
		var prevo1, prevo2;
		if (pokemon.prevo) {
			prevo1 = toID(pokemon.prevo);
			var prevoLearnset = this.getLearnset(prevo1);
			for (var moveid in prevoLearnset) {
				var sources = prevoLearnset[moveid];
				if (typeof sources === 'string') sources = [sources];
				for (var i=0, len=sources.length; i<len; i++) {
					var source = sources[i];
					if (source.charAt(1) === 'L') {
						if (shownMoves[moveid]&2) continue;
						moves.push('b'+source.substr(2).padStart(3,'0')+' '+moveid);
						shownMoves[moveid] = (shownMoves[moveid]|2);
					} else if (source.charAt(1) === 'E') {
						if (shownMoves[moveid]&4) continue;
						moves.push('g000 '+moveid);
						shownMoves[moveid] = (shownMoves[moveid]|4);
					}
				}
			}

			if (Dex.species.get(prevo1).prevo) {
				prevo2 = toID(Dex.species.get(prevo1).prevo);
				prevoLearnset = this.getLearnset(prevo2);
				for (var moveid in prevoLearnset) {
					var sources = prevoLearnset[moveid];
					if (typeof sources === 'string') sources = [sources];
					for (var i=0, len=sources.length; i<len; i++) {
						var source = sources[i];
						if (source.charAt(1) === 'L') {
							if (shownMoves[moveid]&2) continue;
							moves.push('c'+source.substr(2).padStart(3,'0')+' '+moveid);
							shownMoves[moveid] = (shownMoves[moveid]|2);
						} else if (source.charAt(1) === 'E') {
							if (shownMoves[moveid]&4) continue;
							moves.push('h000 '+moveid);
							shownMoves[moveid] = (shownMoves[moveid]|4);
						}
					}
				}
			}
		}
		for (var moveid in learnset) {
			if (moveid in shownMoves) continue;
			moves.push('j000 '+moveid);
			shownMoves[moveid] = (shownMoves[moveid]|1);
		}
		moves.sort();
		var last = '', lastChanged = false;
		for (var i=0, len=moves.length; i<len; i++) {
			var move = Dex.moves.get(moves[i].substr(5));
			if (!move.exists) continue;
			if ((lastChanged = (moves[i].substr(0,1) !== last))) {
				last = moves[i].substr(0,1);
			}
			var desc = '';
			switch (last) {
			case 'a': // level-up move
				if (lastChanged) buf += '<li class="resultheader"><h3>Por nivel</h3></li>';
				desc = moves[i].substr(1,3) === '001' || moves[i].substr(1,3) === '000' ? '&ndash;' : '<small>N.</small>'+(Number(moves[i].substr(1,3))||'?');
				break;
			case 'b': // prevo1 level-up move
				if (lastChanged) buf += '<li class="resultheader"><h3>Por nivel como '+Dex.escapeHTML(Names.species(prevo1))+'</h3></li>';
				desc = moves[i].substr(1,3) === '001' || moves[i].substr(1,3) === '000' ? '&ndash;' : '<small>N.</small>'+(Number(moves[i].substr(1,3))||'?');
				break;
			case 'c': // prevo2 level-up move
				if (lastChanged) buf += '<li class="resultheader"><h3>Por nivel como '+Dex.escapeHTML(Names.species(prevo2))+'</h3></li>';
				desc = moves[i].substr(1,3) === '001' || moves[i].substr(1,3) === '000' ? '&ndash;' : '<small>N.</small>'+(Number(moves[i].substr(1,3))||'?');
				break;
			case 'd': // tm/tutor
				if (lastChanged) buf += '<li class="resultheader"><h3>MT y tutores</h3></li>';
				desc = '<img src="' + Dex.resourcePrefix + 'sprites/itemicons/tm-normal.png" style="margin-top:-3px;opacity:.7" width="24" height="24" alt="MT" />';
				break;
			case 'e': // tutor
				if (lastChanged) buf += '<li class="resultheader"><h3>Tutor</h3></li>';
				desc = '<img src="' + Dex.resourcePrefix + 'sprites/tutor.png" style="margin-top:-4px;opacity:.7" width="27" height="26" alt="T" />';
				break;
			case 'f': // egg move
				if (lastChanged) buf += '<li class="resultheader"><h3>Huevo</h3></li>';
				desc = '<span class="picon" style="margin-top:-12px;'+Dex.getPokemonIcon('egg')+'"></span>';
				break;
			case 'g': // prevo1 egg move
				if (lastChanged) buf += '<li class="resultheader"><h3>Huevo como '+Dex.escapeHTML(Names.species(prevo1))+'</h3></li>';
				desc = '<span class="picon" style="margin-top:-12px;'+Dex.getPokemonIcon('egg')+'"></span>';
				break;
			case 'h': // prevo2 egg move
				if (lastChanged) buf += '<li class="resultheader"><h3>Huevo como '+Dex.escapeHTML(Names.species(prevo2))+'</h3></li>';
				desc = '<span class="picon" style="margin-top:-12px;'+Dex.getPokemonIcon('egg')+'"></span>';
				break;
			case 'i': // event
				if (lastChanged) buf += '<li class="resultheader"><h3>Evento</h3></li>';
				desc = '!';
				break;
			case 'j': // forme change and the like
				if (lastChanged) buf += '<li class="resultheader"><h3>Al cambiar de forma</h3></li>';
				desc = '&ndash;';
				break;
			}
			buf += BattleSearch.renderTaggedMoveRow(move, desc);
		}
		this.$('.utilichart').html(buf);
	},
	renderDetails: function() {
		var pokemon = Dex.species.get(this.id);
		var buf = '';
		var hideBroken = ' onerror="this.style.display=\'none\'"';

		buf += '<li class="resultheader"><h3>Detalles</h3></li>';
		buf += '<li><dl><dt>Color:</dt><dd>'+Names.color(pokemon.color)+'</dd></dl></li>';

		buf += '<li class="resultheader"><h3>Sprites animados</h3></li>';
		buf += '<li class="content"><table class="sprites"><tr><td><img src="' + Dex.resourcePrefix + 'sprites/ani/' + pokemon.spriteid + '.gif"' + hideBroken + ' /></td>';
		buf += '<td><img src="' + Dex.resourcePrefix + 'sprites/ani-shiny/' + pokemon.spriteid + '.gif"' + hideBroken + ' /></td></table>';
		buf += '<table class="sprites"><tr><td><img src="' + Dex.resourcePrefix + 'sprites/ani-back/' + pokemon.spriteid + '.gif"' + hideBroken + ' /></td>';
		buf += '<td><img src="' + Dex.resourcePrefix + 'sprites/ani-back-shiny/' + pokemon.spriteid + '.gif"' + hideBroken + ' /></td></table>';
		buf += '<div style="clear:left"></div></li>';

		if (pokemon.num <= 1025) {
			buf += '<li class="resultheader"><h3>Grito</h3></li>';
			buf += '<li class="content"><audio src="' + Dex.resourcePrefix + 'audio/cries/' + pokemon.spriteid + '.mp3" controls="controls"></audio></li>';
		}

		buf += '<li class="resultheader"><h3>Sprites</h3></li>';
		buf += '<li class="content"><table class="sprites"><tr><td><img src="' + Dex.resourcePrefix + 'sprites/gen5/' + pokemon.spriteid + '.png"' + hideBroken + ' /></td>';
		buf += '<td><img src="' + Dex.resourcePrefix + 'sprites/gen5-shiny/' + pokemon.spriteid + '.png"' + hideBroken + ' /></td></table>';
		buf += '<table class="sprites"><tr><td><img src="' + Dex.resourcePrefix + 'sprites/gen5-back/' + pokemon.spriteid + '.png"' + hideBroken + ' /></td>';
		buf += '<td><img src="' + Dex.resourcePrefix + 'sprites/gen5-back-shiny/' + pokemon.spriteid + '.png"' + hideBroken + ' /></td></table>';
		buf += '<div style="clear:left"></div></li>';

		this.$('.utilichart').html(buf);
	},
	getStat: function(baseStat, isHP, level, iv, ev, natureMult) {
		if (isHP) {
			if (baseStat === 1) return 1;
			return Math.floor(Math.floor(2*baseStat+(iv||0)+Math.floor((ev||0)/4)+100)*level / 100 + 10);
		}
		var val = Math.floor(Math.floor(2*baseStat+(iv||0)+Math.floor((ev||0)/4))*level / 100 + 5);
		if (natureMult && !isHP) val *= natureMult;
		return Math.floor(val);
	}
});
