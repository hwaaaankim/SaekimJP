function frontFaqSyncAria($q, expanded) {
    $q.attr('aria-expanded', expanded ? 'true' : 'false');
}

function frontFaqGetCsrfHeaders() {
    var token = $('meta[name="_csrf"]').attr('content');
    var header = $('meta[name="_csrf_header"]').attr('content');

    if (token && header) {
        var headers = {};
        headers[header] = token;
        return headers;
    }
    return {};
}

function frontFaqIncreaseViewCount($question) {
    var faqId = $question.data('faq-id');
    var viewed = String($question.attr('data-viewed')) === 'true';

    if (!faqId || viewed) {
        return;
    }

    $.ajax({
        url: '/api/v1/faqs/' + faqId + '/view-count',
        type: 'POST',
        headers: frontFaqGetCsrfHeaders()
    }).done(function (response) {
        if (response && response.data && response.data.viewCount !== undefined) {
            $question.find('.js-front-faq-view-count').text(response.data.viewCount);
            $question.attr('data-viewed', 'true');
        }
    });
}

$(document).on('click', '.js-front-faq-question', function () {
    var $q = $(this);
    var targetId = $q.attr('aria-controls');
    var $a = $('#' + targetId);

    if ($q.length === 0 || $a.length === 0) {
        return;
    }

    if ($q.hasClass('active')) {
        $q.removeClass('active');
        frontFaqSyncAria($q, false);
        $a.stop(true, true).slideUp();
        return;
    }

    $('.js-front-faq-question.active').each(function () {
        $(this).removeClass('active');
        frontFaqSyncAria($(this), false);
    });

    $('.faq-answer').stop(true, true).slideUp();

    $q.addClass('active');
    frontFaqSyncAria($q, true);
    $a.stop(true, true).slideDown();

    frontFaqIncreaseViewCount($q);
});