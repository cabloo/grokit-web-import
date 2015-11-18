/// <reference path="../services/import.service.ts"/>

interface PageScope extends ng.IScope {
    file: Blob,
    pasted: string,
    encoding: string,
    filename: string,
    submitPasted: Function,
    submitImport: Function
}

interface FileReaderLoadEventTarget extends EventTarget {
    result: string
}

interface FileReaderLoadEvent extends Event {
    target: FileReaderLoadEventTarget
}

module gwi {
    class ImportController {
        $scope: PageScope;
        Import: gwi.ImportService;
        reader: FileReader;

        static $inject = ['$scope', 'gwi.ImportService'];
        constructor($scope: PageScope, Import: gwi.ImportService) {
            this.$scope = $scope;
            this.Import = Import;
            this.setupScope();
        }

        setupScope() {
            this.$scope.pasted = "";
            this.$scope.submitPasted = this.submitPasted.bind(this);
            this.$scope.submitImport = this.submitImport.bind(this);
        }

        submitPasted() {
            this.Import.view(this.$scope.pasted);
        }

        submitImport(form) {
            this.$scope.encoding = this.$scope.encoding || 'UTF-8';
            if (this.$scope.file)  {
				this.Import.fromFile(this.$scope.file);
            }
        }
    }

    app.controller('gwi.ImportController', ImportController);
}
