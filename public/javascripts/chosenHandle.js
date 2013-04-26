//chosenHandle.js

$(document).ready(function() {
	$('.chzn-select').chosen();

	$('.modalToggle').onClick(function() {
		$('.modal').toggle();
	})
});