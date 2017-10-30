;
(function($) {
  $.fn.magicSearch = function(data) {
      this.each(function() {
          new MagicSearch(this, data);
      });
      return this;
  };
  var BLUR_STATUS = ''; // blur状态
  var SEARCH_STATUS = 'SEARCH_STATUS'; // 选择表头状态
  var FIELD_STATUS = 'FIELD_STATUS'; // 赋值状态
  var DELAY = 300;
  var CurrentItems = require('./current-items');
  var SearchItems = require('./search-items');
  var MagicSearch = function(element, data) {
    this.$input = $(element);
    this.data = data || [];
    this.dataMap = this.makeDataMap();
    this.searchData = this.data;
    this.fieldData = [];
    this.selectedList = this.getSelecteList();
    this.status = BLUR_STATUS;
    this.currentSeletedItem = null;
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

    makeDataMap: function() {
      var data = this.data;
      var dataMap = {};
      for(var i = 0, len = data.length; i < len; i++) {
        var options = data[i].options;
        var dataItem = data[i];
        dataMap[dataItem.value] = dataItem;
        for(var j = 0, jLen = options.length; j < jLen; j++) {
          var item = options[j];
          dataMap[item.value] = $.extend({
            parent: dataItem
          }, item);
        }
      }

      return dataMap;
    },

    getSelecteList: function() {
      var dataMap = this.dataMap;
      var selected = this.$input.val();
      selected = selected ? selected.split(',') : [];
      return selected.map(function(key, index) {
        var item = dataMap[key];
        return item ? item : {
          text: key,
          value: key
        };
      });
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
        data: this.selectedList.map(function(item) {
          return {
            title: item.parent ? item.parent.text : item.text,
            content: item.text
          };
        }),
        afterDelete: $.proxy(this.handleAfterDelete, this)
      });
    },

    initSearchList: function() {
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
      this.$searchInput.on('keyup', $.proxy(this.handleSearchKeyUp, this));
      this.$searchInput.on('keydown', $.proxy(this.handleSearchKeyDown, this));
    },

    /**
     * 进入focus有2种情况
     * 1、未选择表头状态，点击input，此时：currentSeletedItem为空，status为BLUR_STATUS =>展示searchlist
     * 2、searchlist选中后，设置focus，此时：currentSeletedItem有值，status为SEARCH_STATUS =>不要动
     * @return {[type]} [description]
     */
    handleSearchFocus: function(e) {
      if(!this.currentSeletedItem) {
        this.status = SEARCH_STATUS;
        this.handleSearchKeyUp(e);
      }
    },

    /**
     * 进入blur有4种情况
     * 1、search状态，点击外部，此时：currentSeletedItem为空，blurStatus为SEARCH_STATUS，status为SEARCH_STATUS =>状态改为BLUR_STATUS，并隐藏searchlist
     * 2、searchlist选中后，此时：currentSeletedItem有值，blurStatus为SEARCH_STATUS，status为FIELD_STATUS => 不要动
     * 3、field状态，点击外部，此时：currentSeletedItem有值，blurStatus为FIELD_STATU，status为FIELD_STATUS => 状态改为BLUR_STATUS，fieldlist并清除表头
     * 4、fieldlist选中后，此时：currentSeletedItem有值，blurStatus为FIELD_STATU，status为BLUR_STATUS => 不要动
     * @return {[type]} [description]
     */
    handleSearchBlur: function() {
      var self = this;
      var blurStatus = this.status;
      setTimeout(function() {
        if(blurStatus === SEARCH_STATUS && self.status === SEARCH_STATUS) {
          self.status = BLUR_STATUS;
          self.searchList.hide();
          self.resetSearchInput();
        }
        if(blurStatus === FIELD_STATUS && self.status === FIELD_STATUS) {
          self.status = BLUR_STATUS;
          self.fieldList.hide();
          self.clearCurrentSeletedItem();
          self.resetSearchInput();
        }
      }, DELAY);
    },

    handleSearchKeyUp: function(e) {
      switch (e.keyCode) {
        case 38: //up
          return;
        case 40: //down
          return;
        case 13: //enter
          return;
        default:
          var key = this.getSearchKey();
          if (this.currentKey !== key) {
              this.currentKey = key;
              this.search(key);
          }
      }
    },

    handleSearchKeyDown: function(e) {
      if(e.keyCode === 8) {//back
        if(this.status === FIELD_STATUS && !this.getSearchKey()) {
          this.clearCurrentSeletedItem();
          this.resetSearchInput();
          this.fieldList.hide();
          this.status = SEARCH_STATUS;
        }
      }
    },

    handleAfterDelete: function(index) {
      this.selectedList.splice(index, 1);
      this.setInputValue();
    },

    handleSearchSelected: function(item) { //事件触发顺序为，selected => focus2 => blur2
      this.currentSeletedItem = item;
      this.$searchSelected.html(item.text + ':');
      this.resetSearchInput();
      this.$searchInput.focus();
      this.status = FIELD_STATUS;
      this.fieldData = item.options || [];

      this.searchList.hide();
      this.handleSearchKeyUp({});
    },

    handleFieldSelected: function(item) {//事件触发顺序为，selected => blur4
      this.status = BLUR_STATUS;

      this.fieldList.hide();
      this.setSelectedValue(item);
    },

    renderSearchList: function(data) {
      this.searchList.render(data);
      this.searchList.show();
    },

    renderFieldList: function(data) {
      this.fieldList.render(data);
      this.fieldList.show();
    },

    setSelectedValue: function(item) {
      var selected = this.dataMap[item.value];
      this.selectedList.push(selected);
      this.currentList.add({
        title: this.currentSeletedItem.text,
        content: item.text
      });
      this.clearCurrentSeletedItem();
      this.resetSearchInput();
      this.setInputValue();
    },

    clearCurrentSeletedItem: function() {
      this.currentSeletedItem = null;
      this.$searchSelected.empty();
    },

    resetSearchInput: function() {
      this.$searchInput.val('');
      this.currentKey = null;
    },

    setInputValue: function() {
      var selected = this.selectedList.map(function(item) {
        return item.value;
      });
      this.$input.val(selected.join(','));
    },

    getSearchKey: function() {
      return this.$searchInput.val().trim();
    },

    search: function(key) {
      var self = this;
      if(this.timer_) {
        clearTimeout(this.timer_);
      }
      this.timer_ = setTimeout(function() {
        self.renderList(key);
        self.timer_ = null;
      }, DELAY);
    },

    renderList: function(key) {
      if(this.status === SEARCH_STATUS) {
        this.renderSearchList(this.filterData(key, this.data));
        return;
      }
      this.renderFieldList(this.filterData(key, this.fieldData, this.selectedList.map(function(item) {
        return item.value;
      })));
    },

    filterData: function(key, data, exclude) {
      if(!key && (!exclude || !exclude.length)) return data;
      return data.filter(function(item, index) {
        if(key && item.value.indexOf(key) < 0) return false; //关键字不匹配
        if(exclude && exclude.indexOf(item.value) > -1) return false; //已选中
        return true;
      });
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