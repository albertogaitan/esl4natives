(function($, undefined) {

    var form = $('#registration'),
        submit = $('#registration_submit'),
        submitted = false;

    var inputs = $.map(form.find('input, textarea'), function(el, i) {
        return {el: $(el), id: el.id};
    });

    var url_base = 'https://mandrillapp.com/api/1.0';

    function send_email () {

        if (submitted) return false;
        submit.text('Sending...');

        var html = "",
            text = "";

        for (var i = 0, ii = inputs.length; i < ii; ++i) {

            if (inputs[i].el.attr('type') !== 'radio') {
                html += "<p>" + inputs[i].id + ': ' + inputs[i].el.val() + "</p>";
                text += inputs[i].id + ': ' + inputs[i].el.val() + "\n";
            }
            else if (inputs[i].el.is(':checked')) {
                html += "<p>" + inputs[i].id + ': ' + inputs[i].el.val();
                text += inputs[i].id + ': ' + inputs[i].el.val() + "\n";
            }
        }

        var data = {
            "key": "PnJwrUMy1Mt5baaEt2sv6A",
            "message": {
                "html":html,
                "text":text,
                "subject":"New question or suggestion",
                "from_email":"message@eslfornativespeakers.com",
                "from_name":"ESL",
                "to":[{
                    "email":"transformerinstitute@gmail.com",
                    "name":"ESL INFO"
                }]
            },
            "async":false
        };

        $.ajax({
            url: url_base + '/messages/send.json',
            type: 'POST',
            dataType: 'json',
            success: function(resp) {
                submit.text('Sent!');
            },
            data: data
        });

        submit.addClass('disabled');
        submitted = true;
        return false;
    }

    submit.on('click', send_email);

})(jQuery);
