_tag_("jqtags.select", function (select) {

  var jq = module("jQuery");
  var makeOptionString = function (option) {
    return "<option value='" + option.id + "'>" + option.text + "</option>";
  };
  var makeOptionGroup = function (option) {
    return "<optgroup label='" + option.text + "'>";
  };

  var isCorrupted = {"null" : true, "undefined" : true };

  return {
    tagName: "jq-select",
    events: {
      "change .bs-searchbox input": "searchChange"
    },
    accessors: {
      value: {
        type: "string",
        default: "",
        onChange: "valueOnChange"
      },
      multivalue: {
        type: "string",
        default: "",
        onChange: "valueOnChange"
      },
      multiple: {
        type: "boolean",
        default: false
      },
      live: {
        type: "boolean",
        default: true
      }
    },
    methods: ["setOptions"],
    attachedCallback: function () {
      var self = this;
      if (this.$.tagName !== "SELECT") {
        this.$.innerHTML = "<select "
          + (this.$.multiple ? "multiple" : "") +
          ">" + this.$.innerHTML + "</select>";
        this.$select = jq(this.$).find("select");
        this.$select.val((this.$.value + "").split(","));
        this.$select.data(this.$.dataset).selectpicker();
        this.$select.detach();
        this.$select.change(function (e) {
          if (self.$.live) {
            self.$.value = self.$select.val();
            self.trigger("change");
            self.trigger("input");
          }
        });
        this.$select.on("hidden.bs.select", function () {
          if(!self.$.live){
            self.oMyChange();
          }
        });
        this.trigger("jq.query", {
          value: this.$.value,
          callback: function (data) {
            self.updateOptions(data);
          }
        });
      } else {
        jq(this.$).selectpicker();
      }
    },
    oMyChange: function () {
      var self = this;
      self.$.value = self.$select.val();
      self.trigger("change");
      self.trigger("input");
    },
    toList: function (str) {
      return is.String(str) && !is.Empty(str) && !isCorrupted[str] ? str.split(",") : (is.Array(str) ? str : []);
    },
    detachedCallback: function () {
      this.$select.selectpicker("destroy");
    },
    valueOnChange: function (e, oldValue, newValue) {
      this.$select.selectpicker("val", this.toList(newValue));
    },
    setOptions: function (options) {
      var self = this;
      var optionsString = "";
      for (var i in options) {
        if (options[i].children !== undefined) {
          optionsString += makeOptionGroup(options[i]);
          for (var j in options[i].children) {
            optionsString += makeOptionString(options[i].children[j]);
          }
          optionsString += "</option>";
        } else {
          optionsString += makeOptionString(options[i]);
        }
      }
      self.$select.html(optionsString);
      self.$select.val(self.toList(self.$.value));
      self.$select.selectpicker("refresh");
    },
    searchChange: function (e) {
      return preventPropagation(e);
    }
  };
});