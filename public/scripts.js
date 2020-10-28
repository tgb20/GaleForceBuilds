$(() => {

    $('#buildTemplate').hide();

    fetch('/builds')
        .then((response) => {
            response.json().then((json => {

                let builds = json;

                builds.reverse();

                builds.forEach(build => {
                    let buildItem = $('#buildTemplate').clone();
                    buildItem.attr('id', '');
                    buildItem.attr('href', build.downloadLink);
                    buildItem.find('.buildType').text(build.buildType);
                    buildItem.find('.buildNumber').text('#' + build.buildNumber);
                    buildItem.find('.buildDate').text(build.buildDate);
                    buildItem.show();
                    buildItem.appendTo('#builds');
                });
            }));
        });
})