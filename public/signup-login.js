'use strict';

let AUTH_TOKEN
const COOKIE_NAME = 'APP_LOGIN_TOKEN'

function saveLoginResponse(data) {
	Cookies.set(COOKIE_NAME, JSON.stringify(data));
}

function restoreLoginResponse() {
	const dataStr = Cookies.get(COOKIE_NAME);
	if (dataStr) {
		const data = JSON.parse(dataStr)
		console.log('Saved login data', data)
		navigateToStories(data, false)
	}
}


function renderSignUpForm() {

	const createURL = API_URLS.createNewUser;

	return `
	<form class="js-signUp-form" id="signUpForm" action="${createURL}" method="POST">
		<fieldset id="storyBankForm">
			<legend>Sign Up</legend>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="userName" class="mdl-textfield__input" name="userEmail">
				<label id="userNameLabel" class="mdl-textfield__label" for="userName">Email</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="password" class="mdl-textfield__input" type="password" name="password">
				<label id="passwordLabel" class="mdl-textfield__label" for="password">Password</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="passwordConfirm" class="mdl-textfield__input" type="password" name="passwordConfirm">
				<label id="passwordConfirmLabel" class="mdl-textfield__label" for="passwordConfirm">Confirm Password</label>
			</div>
			<button type="submit" class="userButton">Create Account</button>
		</fieldset>
	</form>
	`
}

function handleSignUpClick() {
	$('#signUp').on('click', function (event) {
		event.preventDefault();
		const signUp = renderSignUpForm();
		$('.formsHolder').html(signUp);
		componentHandler.upgradeDom();
	});
}

function renderProfileHeader(result) {
	return `
	<p>${result.email}</p>`
}


function handleCreateNewUser() {
	const $form = $('#signUpForm'),
		email = $form.find('input[name="userEmail"]').val(),
		password = $form.find('input[name="password"]').val(),
		confirmPassword = $form.find('input[name="passwordConfirm"]');

	const url = $form.attr('action');


	const userRecord = $.post(url, {
		email: email,
		password: password
	});
	//This will use the url for logging in but retain email/password
	//creating a new user
	const logInURL = API_URLS.userLogIn;

	userRecord.done(function (data) {
		$('.formsHolder').empty();
		const userLoginRequest = $.post(logInURL, {
			email: email,
			password: password
		});
			userLoginRequest.done(data => navigateToStories(data, true));
	});
}

function renderLogInForm() {

	const logInURL = API_URLS.userLogIn;

	return `
	<form class="js-logIn-form" id="logInForm" action="${logInURL}">
		<fieldset id="storyBankForm">
			<legend>Log In</legend>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="userName" class="mdl-textfield__input" name="userEmail">
				<label id="userNameLabel" class="mdl-textfield__label" for="userName">Email</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="password" class="mdl-textfield__input" type="password" name="password">
				<label id="passwordLabel" class="mdl-textfield__label passwordLabel" for="password">Password</label>
			</div>
			<button type="submit" class="userButton">Log In</button>
		</fieldset>
	</form>
    `
}

function handleLogInClick() {
	$('#logIn').on('click', function (event) {
		event.preventDefault();
		const logIn = renderLogInForm();
		$('.formsHolder').html(logIn);
		componentHandler.upgradeDom();
	});
}


function navigateToStories(data, saveResponse = false) {
	console.log(data);
	AUTH_TOKEN = data.authToken;
	if (saveResponse) {
		saveLoginResponse(data)
	}
	$('.formsHolder').empty();
	$('.storyBankHeader').find('.userSignUp').hide('slow');
	$('.storyBankHeader').find('.userLogIn').hide('slow');
	$('.js-block-result').removeClass('hide');
	$('.js-create-block-view').show('slow');
	$('.profileContainer').removeClass('hide');
	$('.userProfileName').html(data.email);

	const record = $.ajax({
		type: "GET",
		url: `${API_URLS.getUserBlocks}`,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${AUTH_TOKEN}`
		}
	});

	record.done(function (data) {
		return displayBlock(data);
	});
}

function handleUserLogIn() {
	const $form = $('#logInForm'),
		email = $form.find('input[name="userEmail"]').val(),
		password = $form.find('input[name="password"]').val();

	const url = $form.attr('action');

	const userLoginRequest = $.post(url, {
		email: email,
		password: password
	});

	userLoginRequest.done(data => navigateToStories(data, true));
}

function handleLogOutUser() {
	$('#logOutButton').on('click', function (event) {
		event.preventDefault();
		console.log('logout button was clicked');
		AUTH_TOKEN = null;
		Cookies.remove(COOKIE_NAME);
		$('.storyBankHeader').find('.userLogOut').remove();
		$('.storyBankHeader').find('.userSignUp').show('slow');
		$('.storyBankHeader').find('.userLogIn').show('slow');
		$('.js-create-block-view').hide('slow');
		$('.profileContainer').addClass('hide');
		$('.js-block-result').empty();
		$('.js-block-result').addClass('hide');
		$('.storyBlockView-Title').empty();
		$('.storyBlockView').empty();
		$('.storyCreateInterface').empty();
		$('.storyBlockCreateHolder').empty();
	});
}

function userLogInSignUp() {
	$(handleSignUpClick);
	$(handleLogInClick);
	$(handleLogOutUser);
	$(restoreLoginResponse);
}

$(userLogInSignUp);