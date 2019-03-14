
function VariantOptions(params, parentDiv) {

    //option c'est passe par variant_option_hash
    //c'est un hash de forme [option_type : { id, has_image, [option_value : { id , variante : toute les variante related }] }]
    //pour savoir si une variante est appliquable sur des options values faut que la variable soit présente dans toutes les hash related
    var options = params['options'];


    var variant, divs;
    var all_variants = [];
    var do_not_click ="do_not_click" in params ;
    var possible_prices = [];



    function init() {
        //Liste d'options (ex: grandeur / couleur)
        divs = parentDiv.find('.product-variants .variant-option-values');
        disable_add_to_cart(parentDiv);
        all_variants = find_all_variants(options);
        if(!do_not_click) {
            divs.each(function () {
                $(this).find("a:not.disabled").first().click();
            });
        }
        divs.find("a").click(function(e){
            e.preventDefault();
            if($(this).hasClass("disabled")){
                //si le li est disabled on va décocher les autres .selected parceque y'avais pas de variantes possibles
                $(this).parents("form").find(".selected").not(this).removeClass("selected");
            }
            else {
                if($(this).hasClass("selected")) {
                    $(this).parents("ul").find("a").not(this).removeClass("selected").removeClass("not-selected");
                }
                else{
                    $(this).parents("ul").find("a").not(this).removeClass("selected").addClass("not-selected");
                }
            }
            $(this).toggleClass("selected").removeClass("not-selected");
            var possible_variants = try_variant();
            var probable_variants = probable_variant(possible_variants);
            setup_for_possible_variants(possible_variants, probable_variants);
        });
        var possible_variants = try_variant();
        var probable_variants = probable_variant(possible_variants);
        setup_for_possible_variants(possible_variants, probable_variants);
    }

    function probable_variant(possible_variants){

        var probable_variant = [];
        divs.find("a.disabled").removeClass("disabled");

        divs.each(function(){

            console.log($(this).find("a:not(.not-selected)").length);
                $(this).find("a").each(function() {
                    var type = $(this).data("type-id");
                    var value = $(this).data("value-id");


                    if (options[type] != undefined && options[type].option_values[value] != undefined) {
                        variants = options[type].option_values[value].variants;
                        $.each(variants, function (i, v) {
                            if (possible_variants.indexOf(v.id) >= 0) {
                                $.each(variants, function (i2, v2) {
                                    probable_variant.push(v2.id)
                                });
                            }
                        });
                    }
                    else {
                    }
                });


        });
        if(probable_variant.length == 0 ){
            return all_variants
        }
        console.log("probable");
        console.log(probable_variant);

        return probable_variant;


    }
    //on essaie de trouver une ou des variantes selon ce qui est coché
    function try_variant(){

        var possible_variants = all_variants;
        divs.find("a.disabled").removeClass("disabled");
        divs.find("a.selected").each(function(){


            var type = $(this).data("type-id");
            var value = $(this).data("value-id");


            if(options[type] != undefined && options[type].option_values[value] != undefined) {
                variants = options[type].option_values[value].variants;
                var new_possible_variants = [], new_possible_prices = [];
                $.each(variants, function (i, v) {

                    //si la variante est la au deux place c'est qu'on peu la faire passer au next step
                    if (possible_variants.indexOf(v.id) >= 0) {
                        new_possible_variants.push(v.id);
                        new_possible_prices.push(v.price);
                    }

                });
                possible_variants = new_possible_variants;
                //wowowowow sketchy mais j'en ai besoin plus tard
                possible_prices = new_possible_prices;
            }
            else {
                possible_variants = [];
            }


        });
        console.log(possible_variants);

        return possible_variants;


    }

    function find_all_variants(options){
        //on parse le table de stock pis on se pogne toutes les id de variantes.

        var all_variants =[];
        $.each(options, function(i, option){
            $.each( option.option_values, function(ovid, option_value){
                $.each(option_value.variants, function(vid, variant){
                    if(!all_variants.indexOf(variant.id)>=0){
                        all_variants.push(variant.id);
                    }
                });

            });

        });
        return all_variants;

    }
// on enable et disable ce qui a pu rapportbasé sur les variantes qui seraient possible avec ce qui est coché
    function setup_for_possible_variants(possible_variants, probable_variants){
        divs.find("a").not(".selected").each(function(li){
            var type = $(this).data("type-id");
            var value = $(this).data("value-id");
            var $this = $(this);

            //ca l'air cave de toute disabler pis de enabler au cas par cas, mais c'est plus simple a coder de même
            $this.addClass("disabled").addClass("not-possible");
            if(options[type] != undefined) {

                var variants = options[type].option_values[value];

                if(variants != undefined){
                    variants = variants.variants;
                    $.each(variants, function (i, v) {
                        if (probable_variants.indexOf(v.id) >= 0) {
                            //on a au moin une variant possible avec cette case la fauqe c'est valide
                            $this.removeClass("disabled");
                        }
                        if (possible_variants.indexOf(v.id) >= 0) {
                            //on a au moin une variant possible avec cette case la fauqe c'est valide
                            $this.removeClass("not-possible");
                        }


                    });
                }
            }
        });
        set_price(possible_variants);
        if(possible_variants.length==0){
            console.log("ya broke");
            console.log(parentDiv.find(".status_out_of_stock"));
            parentDiv.find(".status_out_of_stock").slideToggle();
            setTimeout(function(){$(".status_out_of_stock:visible").slideToggle();
            }, 5000)
        }
        if(possible_variants.length==1){
            parentDiv.find('.variant_id, form[data-form-type="variant"] input[name$="[variant_id]"]').val(possible_variants[0]);
            parentDiv.find('button[type=submit]').attr('disabled', false).fadeTo(100, 1).removeClass('disabled').unbind("click");
            //on va quand même mettre selected sur le stock qui est still enabled
            parentDiv.find('a').not('.not-possible').not(".selected").not(".not-selected").addClass("selected");
            console.log(parentDiv.find('a'));


        }
        else{
            disable_add_to_cart(parentDiv);


        }
        show_variant_images(possible_variants, options);
    }
    function set_price(){

        var max_price = Math.max.apply(null, possible_prices.map(to_f));
        var min_price = Math.min.apply(null, possible_prices.map(to_f));
        console.log(max_price);

        if(min_price != max_price) {
            parentDiv.find('.products-item-regular-price').html('<span class="price from">' + min_price + '</span> - <span class="price to">' + max_price + '</span> $');
        }
        else{
            parentDiv.find('.products-item-regular-price').html(possible_prices[0]);

        }

    }

    function to_f(string) {
        //fonction sketch qui enleve tout ce qui est pas un point pis une décimale pis transforme en float, ca permet de compare des prix qui sont formatter parceque j'ai aps le goût de formater dans le JS
        return string ? parseFloat(string.replace(/[^\d\.]/g, '')) : 0;
    }

    function disable_add_to_cart(parentDiv){

        parentDiv.find('button[type=submit]').unbind("click").fadeTo(0, 0.25).addClass('disabled').click(function(e){
                e.preventDefault();
                console.log( $(e.target).parents().eq(3));

                var pick_a_size =  $(e.target).parents().eq(3).find(".pick_a_size");
                pick_a_size.slideToggle();
                setTimeout(function(){pick_a_size.slideToggle();}, 5000)
            }

        );
    }

    $(document).ready(init);
}