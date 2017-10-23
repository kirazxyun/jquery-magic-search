;
(function($) {
    $.fn.magicSearch = function(data) {
        this.each(function() {
            new MagicSearch(this, data);
        });
        return this;
    };
    var BLUR_STATUS = ''; // blur状态
    var KEY_STATUS = 'KEY_STATUS'; // 选择关键字状态
    var VALUE_STATUS = 'VALUE_STATUS'; // 赋值状态
    var DELAY = 300;
    var CurrentItems = require('./current-items');
    var SearchItems = require('./search-items');
    var MagicSearch = function(element, data) {
      this.$input = $(element);
      this.data = data || [];
      this.selectedList = [{
          title: 'aaa',
          content: 'bbb'
        }];
      this.status = BLUR_STATUS;
      this.currentSeletedItem = {};
      this.init();
    };

    $.extend(MagicSearch.prototype, {
      init: function() {
        this.createDom();
        this.initCurrentList();
        this.initSearchList();
        this.initFieldList();
        this.attachEvents();
      },

      createDom: function() {
        var tpl = this.getBodyTpl();
        this.$searchBox = $(tpl).appendTo(this.$input.hide().parent());
        this.$searchInput = this.$searchBox.find('.js-search-input');
        this.$searchSelected = this.$searchBox.find('.js-search-selected');
      },

      initCurrentList: function() {
        this.currentList = new CurrentItems({
          $container: this.$searchBox.find('.js-current-list'),
          data: this.selectedList,
          afterDelete: $.proxy(this.handleAfterDelete, this)
        });
      },

      initSearchList: function() {
        var self = this;
        this.searchList = new SearchItems({
          $container: this.$searchBox.find('.js-search-list'),
          afterSelected: $.proxy(this.handleSearchSelected, this)
        });
      },

      initFieldList: function() {
        this.fieldList = new SearchItems({
          $container: this.$searchBox.find('.js-field-list'),
          afterSelected: $.proxy(this.handleFieldSelected, this)
        });
      },

      attachEvents: function() {
        this.$searchInput.on('focus', $.proxy(this.handleSearchFocus, this));
        this.$searchInput.on('blur', $.proxy(this.handleSearchBlur, this));
      },

      handleSearchFocus: function() {
        if (this.currentSeletedItem.text) { // 如果已经是选择了要搜索的选项。
          this.status = VALUE_STATUS;
        } else {
          this.status = KEY_STATUS;
          this.searchList.render(this.data);
          this.searchList.show();
        }
      },

      handleSearchBlur: function() {
        var self = this;
        setTimeout(function() {
          if (self.status !== VALUE_STATUS) {
            self.status = BLUR_STATUS;
            self.searchList.hide();
          }
        }, DELAY);
      },

      handleAfterDelete: function(index) {
        this.selectedList.splice(index, 1);
      },

      handleSearchSelected: function(item) {
        this.currentSeletedItem = item;
        this.status = VALUE_STATUS;
        this.$searchSelected.html(item.text + ':');

        this.fieldList.render(this.data);
        this.fieldList.show();
        this.setInputFocus();
      },

      handleFieldSelected: function(item) {
        var selected = {
          title: this.currentSeletedItem.text,
          content: item.text
        };
        this.selectedList.push(selected);
        this.currentList.add(selected);
        this.setSelectedValue();
        this.currentSeletedItem = {};
        this.status = BLUR_STATUS;
        this.$searchSelected.empty();
        this.fieldList.hide();
        this.setInputFocus();
      },

      setInputFocus: function() {
        var self = this;
        setTimeout(function() {
          self.$searchInput.focus();
        }, DELAY);
      },

      getBodyTpl: function() {
        return '<div class="magic-search">' + 
                  '<div class="magic-search__inner">' +
                    '<span class="magic-search__go">' +
                      '<i>ic</i>' +
                    '</span>' +
                    '<div class="magic-search__main">' +
                      '<div class="m-search">' +
                        '<div class="m-search__area">' +
                          '<div class="js-current-list">' +
                          '</div>' +
                          '<span class="search-selected js-search-selected"></span>' +
                          '<div class="search-entry">' +
                            '<input placeholder="Click here for filters." class="search-input js-search-input">' +
                            '<div class="js-search-list" style="display: none;"></div>' +
                            '<div class="js-field-list" style="display: none;"></div>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' + 
                    '<span title="清空" class="magic-search__clear js-clear-btn">' +
                      '<i>c</i>' +
                    '</span>' +
                  '</div>' +
                '</div>';
      }
    });
})(jQuery);