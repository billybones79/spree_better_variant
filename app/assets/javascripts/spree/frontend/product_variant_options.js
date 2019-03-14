
var show_variant_images = function(variants_ids, options) {


    if (typeof(variants_ids) == 'number') {
        variants_ids = [variants_ids]
    }

    var parent_nodes = [];
    var variant_siblings = [];
    var to_find = variants_ids[0];


    $.each(options, function(key, value) {
        if(value['has_image']==true)
        {
            $.each(value["option_values"], function (subkey, subvalue) {

                if (subvalue["variants"][to_find]) {

                    parent_nodes.push(subkey);
                }
            });
        }
    });


    if (parent_nodes != []) {
        $.each(parent_nodes, function(key, parent_node) {
            $.each(options, function(keyopt, valueopt) {
                if(valueopt["option_values"][parent_node]) {
                    $.each(valueopt["option_values"][parent_node]["variants"], function (local_variant_id, local_variant_node) {
                        variant_siblings.push(local_variant_id);
                    });
                }
            });
        });
    }

    var $matches = $('#gallery_thumb a').filter(function() {

        if ($.inArray(this.getAttribute("data-variant-id"), variant_siblings) > -1)
        {

            return $.inArray(this.getAttribute("data-variant-id"), variant_siblings) > -1;
        }
    });


    var thumb = $matches.eq(0);

    if(thumb.size()>0) {

        $('#gallery_thumb a').removeClass('active');
        thumb.addClass('active');
        thumb.parent().addClass('selected');
        var $img = thumb.find("img");
        $img.click();
        //$img.trigger("mouseenter");

    }
    else{
        var thumb = $("#gallery_thumb a:not([data-variant-id])").first();
        $('#gallery_thumb a').removeClass('active');
        thumb.addClass('active');
        thumb.parent().addClass('selected');
        var $img = thumb.find("img");
        $img.click();
        //$img.trigger("mouseenter");

    }
};

var show_all_variant_images = function() {
    $('li.vtmb').show();
};