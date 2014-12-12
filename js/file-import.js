$(document).ready(function() {
	$('#importFileButton').click(function() { $("#importFile").trigger("click"); });
	$('#importFile').change(importFile);

	function importFile() {
		var $inputFile = $('#importFile');
		var inputFile = $inputFile.prop('files')[0];

		if(!inputFile) {
			console.log('not importing file, no file selected');
			return;
		}
		var inputFileName = inputFile.name;
		$inputFile.val('');

		var fileExtension = inputFileName.substring(inputFileName.length - 3);
		if(!(fileExtension === 'csv' || fileExtension == 'txt')) {
			showErrorMessage('File must be .csv or .txt');
			return;
		}

		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var reader = new FileReader();
			reader.onload = function(e) {
				var delimiter = $('#delimiter').val() || ',';
				var fileContent = parseFileContent(e.target.result, delimiter);
				loadFileContentIntoPage(fileContent);
				showSuccessMessage('Imported ' + inputFileName + ' to page');
			}

			reader.readAsText(inputFile);
		} else {
			showErrorMessage('File import is not fully supported by your browser.');
		}
	}

	function parseFileContent(rawFileContent, delimiter) {
		if(!rawFileContent) {
			console.log('file is empty!');
			return;
		} else if(!delimiter) {
			console.log('invalid file delimiter!');
			return;
		}

		var lines = rawFileContent.split(/\n/);
		var jsonData = [];

		for(var i = 0, len = lines.length; i < len; i++) {
			var line = lines[i].trim();

			if(!line) {
				continue;
			}

			var row = line.split(delimiter);

			if(!jsonData.headers) {
				jsonData.headers = row;
			} else {
				jsonRow = buildJsonRow(jsonData.headers, row);
				jsonData.push(jsonRow);
			}
		}

		return jsonData;
	}

	function buildJsonRow(headers, row) {
		var jsonRow = {};
		var rowLength = row.length;

		for(var i = 0, len = headers.length; i < len; i++) {
			if(i >= rowLength) {
				// more headers than there are elements in the row!
				break;
			}

			var property = headers[i];
			var value = row[i];
			jsonRow[property] = value;
		}

		return jsonRow;
	}

	function loadFileContentIntoPage(fileContent) {

		var $table = $('<table></table>');
		$table.append(getTableHeadersHtml(fileContent.headers));
		$table.append(generateTableBodyHtml(fileContent));

		var $tableDiv = $('#importTable').html($table);
	}

	function getTableHeadersHtml(headers) {
		var $thead = $('<thead></thead>');

		for(var i = 0, len = headers.length; i < len; i++) {
			var $th = $('<th></th>').text(headers[i]);
			$thead.append($th);
		}

		return $thead;
	}

	function generateTableBodyHtml(fileContent) {
		var $tbody = $('<tbody></tbody>');
		var headers = fileContent.headers;

		for(var i = 0, len = fileContent.length; i < len; i++) {
			var row = fileContent[i];
			$tr = $('<tr></tr>');

			for(var j = 0, hLen = headers.length; j < hLen; j++) {
				var header = headers[j];
				var rowValue = row[header] || '';
				$td = $('<td></td>').text(rowValue);
				$tr.append($td);
			}

			$tbody.append($tr);
		}


		return $tbody;
	}

	function showErrorMessage(text) {
		showFeedback('Error! ' + text, 'errorMessage');
	}

	function showSuccessMessage(text) {
		showFeedback('Success! ' + text, 'successMessage');
	}

	function showFeedback(text, css) {
		$feedbackDiv = $('#feedback').text(text).attr('class', css).show();
	}
});
