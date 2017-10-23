var SearchItems = function(opt) {
	this.options = $.extend({
		$container: null,
		data: [],
		afterSelected: $.noop
	}, opt || {});
	this.$container = this.options.$container;

	this.init(this.options.data);
};

$.extend(SearchItems.prototype, {
	init: function(data) {
		this.createDom();
		this.render(data);
		this.attachEvents();
	},

	attachEvents: function() {
		this.$itemContainer.on('click', '.js-search-item', $.proxy(this.handleItemClick, this));
	},

	handleItemClick: function(e) {
		var index = $(e.currentTarget).parent().index();
		var item = this.items[index];
		this.options.afterSelected.call(this, item);
	},

	createDom: function() {
		var tpl = this.getBodyTpl();
		this.$container.append(tpl);
		this.$itemContainer = this.$container.find('.js-item-container');
	},

	render: function(data) {
		this.clear();

		var cloneData = $.extend(true, [], data);
		for(var i = 0, len = cloneData.length; i < len; i++) {
			this.renderItem(cloneData[i]);
		}
	},

	renderItem: function(item) {
		var tpl = this.getItemTpl(item);
		var $item = $(tpl).appendTo(this.$itemContainer);
		this.addItem($item, item);
	},

	addItem: function($item, item) {
		this.$items.push($item);
		this.items.push(item);
	},

	deleteItem: function(index) {
		this.$items.splice(index, 1)[0].remove();
		return this.items.splice(index, 1)[0];
	},

	getBodyTpl: function() {
		return '<ul class="search-ul js-item-container"></ul>';
	},

	getItemTpl: function(item) {
		return '<li><a href="javascript:;" class="js-search-item">' + item.text + '</a></li>';
	},

	clear: function() {
		this.$itemContainer.empty();
		this.$items = [];
		this.items = [];
	},

	hide: function() {
		this.$container.hide();
	},

	show: function() {
		this.$container.show();
	}
});

module.exports = SearchItems;