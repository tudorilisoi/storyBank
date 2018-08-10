'use strict';

function renderStoryUpdateMenu(title, image, content, publicStatus, publicBoolean, id) {

    const updateUrl = API_URLS.updateStory;

    //TODO need to make the toggle switch the current public
    //setting of the story when rendered. The code below is
    //being ignored by default behavior with mdl
    let isPublic;

    if (publicBoolean === false) {
        isPublic = null;
    } else {
        isPublic = `is-checked`;
        console.log('kiwi', 'should be checked')
    }

    return `
    <form id="editStory" action="${updateUrl}/${id}" method="PUT">
        <fieldset id="storyBankForm">
            <legend>Edit ${title}</legend>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input id="title" class="mdl-textfield__input" name="title" value="${title}">
                <label id="titleLabel" class="mdl-textfield__label" for="title">Title</label>
            </div>
            <input type="file" onchange='onChooseFile(event, onFileLoad.bind(this, "contents"))' id="image" class="mdl-textfield__input"
                name="image">
            <div class="imageThumbBox">
                <div class="canvasHolder">
                    <canvas id="canvas" />
                </div>
                <button id="rotate-cw" class="userButton hide">Rotate</button>
                <img id="storyCurrentImagePreview" class="currentImageThumb" src="${image}">
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="contentHolder">
                <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content">${content}</textarea>
                <label id="contentLabel" class="mdl-textfield__label" for="content">Edit your story</label>
            </div>
            <p class="publicStatus">${publicBoolean}</p>
            <p name="currentPublicStatus">Your story is currently ${publicStatus}</p>
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect ${isPublic}" for="switch-2">
                <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
                <span class="mdl-switch__label">publicStatus?</span>
            </label>
            <button type="submit" class="userButton">Update</button>
            <button type="button" class="userButton" id="cancelStoryCreate">Cancel</button>
        </fieldset>
    </form>
    `
}

function displayStoryUpdateMenu() {
    $('.storyBlockView').on('click', 'button#displayStoryEditMenu', function (event) {
        event.preventDefault();
        //TODO try refactoring this by making a GET story by ID req
        //and use the res object as ref rather than searching DOM
        const currentStorySelect = $(event.target).closest('.storyDetailView');
        const currentTitle = currentStorySelect.find('.storyTitle').text();
        const currentImage = currentStorySelect.find('.storyImage').attr('src');
        const currentContent = currentStorySelect.find('.storyContent').text();
        const currentPublicStatus = currentStorySelect.find('.publicStatusInfo').text();
        const currentPublicBoolean = currentStorySelect.find('.publicStatus').text();
        const currentId = currentStorySelect.find('.storyId').text();
        const storyUpdateMenu = renderStoryUpdateMenu(
            currentTitle,
            currentImage,
            currentContent,
            currentPublicStatus,
            currentPublicBoolean,
            currentId
        );

        $('.storyBlockView').hide('slow');
        $('.storyCreateInterface').html(storyUpdateMenu);
        componentHandler.upgradeDom();
    });
}

function handleStoryUpdate() {
    const $form = $('#editStory'),
        title = $form.find('input[name="title"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find('#switch-2')
    const publicStatus = ckBox.is(':checked')
    const url = $form.attr('action');

    let imageSrc;

    if (lastUpload === null) {
        imageSrc = $form.find('image[id="storyCurrentImagePreview"]').attr('src');
    } else {
        imageSrc = lastUpload;
    }

    const formData = {
        title: title,
        image: imageSrc,
        content: content,
        publicStatus: publicStatus
    }

    const posting = $.ajax({
        type: "PUT",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        dataType: 'json',
        data: JSON.stringify(formData)
    });

    posting.done(function (data) {
        console.log(data);
        console.log(data.story.image);
        const message = renderMessages(data.message);
        $('.storyCreateInterface').empty();
        const newStory = renderStory(data);
        $('.storyBlockView').find(`.storyDetailView[id="${data.story.id}"]`).replaceWith(newStory);
        $('.storyBlockView').show('slow');
        $('.deleteMenuHolder').removeClass('hide');
        $('.deleteMenuHolder').html(message);
    })

}

function renderStoryDeleteMenu(title, id) {

    const deleteUrl = API_URLS.deleteStory;

    return `
    <form id="deleteStory" class="deleteBlockMenu" action="${deleteUrl}/${id}" method="DELETE">
        <fieldset id="storyBankForm">
            <legend>Delete Story</legend>
            <p>Are you sure you want to delete
                <span class="deleteBlockTitle">${title}</span>?</p>
            <button id="deleteStorySubmit" class="deleteButton userButton" type="submit">Yes</button>
            <button id="cancelStoryDeletion" class="cancelDeleteButton userButton" type="button">Cancel</button>
        </fieldset>
    </form>
    `
}

function displayDeleteStoryMenu() {
    $('.storyBlockView').on('click', 'button#displayStoryDeleteMenu', function (event) {
        event.preventDefault();
        $('.deleteMenuHolder').removeClass('hide');
        const storyId = $(event.target).closest('.storyDetailView').find('.storyId').text();
        const storyTitle = $(event.target).closest('.storyDetailView').find('.storyTitle').text();
        const deleteMenu = renderStoryDeleteMenu(storyTitle, storyId);
        $('.deleteMenuHolder').html(deleteMenu);
    });
}

function hideStoryDeleteMenu() {
    $('.deleteMenuHolder').on('click', 'button#cancelStoryDeletion', function (event) {
        event.preventDefault();
        $('.deleteMenuHolder').addClass('hide');
    });
}

function handleStoryDeletion() {
    const $form = $('#deleteStory'),
        url = $form.attr('action');

    const deleting = $.ajax({
        type: "DELETE",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        }
    })

    deleting.done(function (data) {
        const message = renderMessages(data.message);
        $('.deleteMenuHolder').html(message);
        $('.storyBlockView').empty();
        const blockId = $('.storyBlockView-Title').find('.blockId').text();
        console.log(blockId);
        getBlocksWithStories(blockId);
    })
}


function stories2() {
    $(displayDeleteStoryMenu);
    $(hideStoryDeleteMenu);
    $(displayStoryUpdateMenu);
}

$(stories2);