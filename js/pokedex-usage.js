/**
 * Usage stats (data/usage/<game>/, built by build-tools/build-usage-stats).
 */

var Usage = {
	cache: {},
	get: function (file) {
		var url = '/data/usage/' + Game.id + '/' + file;
		if (!this.cache[url]) this.cache[url] = $.getJSON(url);
		return this.cache[url];
	},
	formatName: function (format) {
		return format.name.replace(/^\[Gen \d+\] /, '');
	},
	monthName: function (month) {
		var parts = month.split('-');
		return new Date(Number(parts[0]), Number(parts[1]) - 1, 1).toLocaleDateString('es', {month: 'long', year: 'numeric'});
	},
	percent: function (value) {
		return ('' + value).replace('.', ',') + '%';
	}
};

var PokedexUsagePanel = PokedexResultPanel.extend({
	events: {
		'change select[name=format]': 'changeFormat',
		'change select[name=month]': 'changeMonth',
		'click .tabbar button': 'selectTab'
	},
	initialize: function (formatid) {
		this.formatid = toID(formatid || '');
		this.month = '';
		this.shortTitle = 'Uso';

		var buf = '<div class="pfx-body"><form class="pokedex">';
		buf += '<h1><a href="' + Game.root + '" data-target="replace">Pok&eacute;dex</a></h1>';
		buf += '<ul class="tabbar centered" style="margin-bottom: 18px"><li><button class="button nav-first" value="">Buscar</button></li>';
		buf += '<li><button class="button" value="pokemon/">Pok&eacute;mon</button></li>';
		buf += '<li><button class="button" value="moves/">Movimientos</button></li>';
		buf += '<li><button class="button nav-last cur" value="usage/">Uso</button></li></ul>';
		buf += '</form><div class="usage"><p><em>Cargando...</em></p></div></div>';
		this.html(buf);

		var self = this;
		Usage.get('index.json').done(function (index) {
			self.index = index;
			self.renderSelectors();
		}).fail(function () {
			self.$('.usage').html('<p>Todav&iacute;a no hay estad&iacute;sticas de uso.</p>');
		});
	},
	selectTab: function (e) {
		e.preventDefault();
		this.app.go(e.currentTarget.value, this, true);
	},
	renderSelectors: function () {
		var formats = this.index.formats.filter(function (format) { return format.months.length; });
		if (!formats.length) {
			this.$('.usage').html('<p>Todav&iacute;a no hay combates registrados en los formatos de ' + Dex.escapeHTML(Game.name) + '.</p>');
			return;
		}
		var format = formats.find(function (f) { return f.id === this.formatid; }, this) || formats[0];
		this.formatid = format.id;
		if (!format.months.some(function (m) { return m.month === this.month; }, this)) this.month = format.months[0].month;

		var buf = '<p><label>Formato: <select name="format" class="button">';
		for (var i = 0; i < formats.length; i++) {
			buf += '<option value="' + formats[i].id + '"' + (formats[i].id === format.id ? ' selected' : '') + '>' + Dex.escapeHTML(Usage.formatName(formats[i])) + '</option>';
		}
		buf += '</select></label> <label>Mes: <select name="month" class="button">';
		for (var j = 0; j < format.months.length; j++) {
			var month = format.months[j];
			buf += '<option value="' + month.month + '"' + (month.month === this.month ? ' selected' : '') + '>' + Usage.monthName(month.month) + '</option>';
		}
		buf += '</select></label></p><div class="usagelist"><p><em>Cargando...</em></p></div>';
		this.$('.usage').html(buf);
		this.renderList();
	},
	changeFormat: function (e) {
		this.formatid = e.currentTarget.value;
		this.renderSelectors();
	},
	changeMonth: function (e) {
		this.month = e.currentTarget.value;
		this.renderList();
	},
	renderList: function () {
		var self = this;
		Usage.get(this.formatid + '/' + this.month + '.json').done(function (stats) {
			var buf = '<p>' + stats.battles + ' combates, ' + stats.teams + ' equipos. Porcentaje de equipos que llevan cada Pok&eacute;mon.</p>';
			buf += '<ul class="utilichart nokbd">';
			for (var i = 0; i < stats.pokemon.length; i++) {
				var species = Dex.species.get(stats.pokemon[i].id);
				if (!species.exists) continue;
				buf += '<li class="result">' + BattleSearch.renderTaggedPokemonRowInner(species, Usage.percent(stats.pokemon[i].usage)) + '</li>';
			}
			buf += '</ul>';
			self.$('.usagelist').html(buf);
		});
	}
});
