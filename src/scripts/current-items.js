// 结构如下
// <div class="search-current">
	// 	<span class="title">状态:</span> 
	// 	<span class="content">删除</span> 
	// 	<span class="remove">X</span>
// </div>
/**
 * 渲染选中的项
 * @param {[type]} data [description]选中的数据，格式为[{title: 'aaa', content: 'bbb'},...]
 */
var CurrentItems = function(opt) {
	this.options = $.extend({
		$container: null,
		data: [],
		afterDelete: $.noop
	}, opt || {});
	this.$container = this.options.$container;
	this.$items = [];
	this.items = [];

	this.init(this.options.data);
};

$.extend(CurrentItems.prototype, {
	init: function(data) {
		this.render(data);
		this.attachEvents();
	},

	attachEvents: function() {
		this.$container.on('click', '.js-delete-btn', $.proxy(this.handleDelete, this));
	},

	handleDelete: function(e) {
		var index = $(e.target).parent().index();
		var item = this.deleteItem(index);
		this.options.afterDelete.call(this, item);
	},

	render: function(data) {
		this.clear();

		var cloneData = $.extend(true, [], data);
		for(var i = 0, len =  cloneData.length; i < len; i++) {
			this.renderItem(cloneData[i]);
		}
	},

	renderItem: function(item) {
		var tpl = this.getItemTpl(item);
		var $item = $(tpl).appendTo(this.$container);
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

	getItemTpl: function(item) {
		return '<div class="search-current">\
							<span class="title">' + item.title + ':</span>\
							<span class="content">' + item.content + '</span>\
							<span class="remove js-delete-btn">X</span>\
						<div>';
	},

	// methods
	clear: function() {
		this.$container.empty();
		this.items = [];
		this.$items = [];
	},

	add: function(item) {
		this.renderItem(item);
	},

	delete: function(index) {
		this.deleteItem(index);
	},

	hide: function() {
		this.$container.hide();
	},

	show: function() {
		this.$container.show();
	}
});

module.exports = CurrentItems;
