define(['app'], function (app) {
    'use strict';
    app.controller('homeController', ['$scope', '$rootScope', 'DataService', 'orgList', '$filter', 'announcements', 'meetingList', 'charterStatus', 'teamImgList', 'helpDocList', 'myInboxItems', 'UtilityService', 'AuthService', 'USER_GROUPS',
    function ($scope, $rootScope, DataService, orgList, $filter, announcements, meetingList, charterStatus, teamImgList, helpDocList, myInboxItems, UtilityService, AuthService, USER_GROUPS) {
        $scope.title = "Welcome to Prompt Portal";
        $scope.organizationLink = "#/org/";
        UtilityService.setInboxItemLinks(myInboxItems);
        $scope.myInboxItems = myInboxItems;
        // get the PCODE of roganizations that are in InboxItems
        //console.log($scope.myInboxItems);
        var organizationIDs = [];
        for (var i = 0; i < $scope.myInboxItems.length; i++) {
            organizationIDs.push($scope.myInboxItems[i].PCODE);
        }
        $scope.organizationIDs = organizationIDs;
        //
        $scope.taggleCount = false;
        //
        $scope.organiztionList = orgList;
        $scope.gridOptions = {};
        $scope.gridOptions = {
            //enableFiltering: true,
            data: orgList,
            columnDefs: [
                             {
                                 field: 'ID', displayName: 'Pcode', width: '10%', enableHiding: false,
                                 cellTemplate: '<a ui-sref="org.summary.workflow({ id: row.entity.ID })" class="icon-bar"><div class="ui-grid-cell-contents">{{row.entity.ID}}</div></a>'
                             },
                             {
                                 field: 'Name', displayName: 'Organization Name', width: "*", enableHiding: false,
                                 cellTemplate: '<a ui-sref="org.summary.workflow({ id: row.entity.ID })" class="icon-bar"><div class="ui-grid-cell-contents">{{row.entity.Name}}</a>' +
                                     //'&nbsp&nbsp<i  class="fa fa-comment" style="color:#0A6FA0;" ng-if="grid.appScope.displayCommentCount(row.entity.ID)" ng-click="grid.appScope.taggleCount = !grid.appScope.taggleCount"></i>' +
                                     '&nbsp&nbsp<i  class="fa fa-comment" style="color:#0A6FA0;" ng-if="grid.appScope.displayCommentCount(row.entity.ID)" ng-click="grid.appScope.setCommentCount(row.entity.ID)"></i>' +
                                     //'&nbsp<span id="{{row.entity.ID}}" ng-if="grid.appScope.taggleCount">{{grid.appScope.getCommentsCount(row.entity.ID)}}<span>'
                                      '&nbsp<span style="color:#f84358;" id="{{row.entity.ID}}"><span>'
                             },
                             { field: 'DistrictName', displayName: 'Region', width: '15%', enableHiding: false },
                             { field: 'RMName', displayName: 'RM', width: '15%', enableHiding: false },
                             { field: 'MeetingDate', displayName: 'Meeting Date', width: '15%', type: 'date', cellFilter: 'date:\'MM/dd/yyyy\'', enableHiding: false },
                          
            ]
        };
        //
        $scope.displayCommentCount = function (id) {
            //if(AuthService.userHasRole('Admin,Supervisor,SVP'))
            for (var i = 0; i < $scope.myInboxItems.length; i++) {
                if ($scope.myInboxItems[i].PCODE === id) {
                    $scope.commentCount = $scope.myInboxItems[i].Count_Of_Comments;
                    if ($scope.commentCount > 0)
                        return true;
                }
            }
            return false;
        }
        $scope.getCommentsCount = function (id) {
            //if(AuthService.userHasRole('Admin,Supervisor,SVP'))
            for (var i = 0; i < $scope.myInboxItems.length; i++) {
                if ($scope.myInboxItems[i].PCODE === id) {
                    $scope.commentCount = $scope.myInboxItems[i].Count_Of_Comments;
                    if ($scope.commentCount > 0)
                        return $scope.commentCount;
                }
            }
        }
        $scope.setCommentCount = function (id) {
            //if(AuthService.userHasRole('Admin,Supervisor,SVP'))
            $scope.count = 0;
            for (var i = 0; i < $scope.myInboxItems.length; i++) {
                if ($scope.myInboxItems[i].PCODE === id) {
                    $scope.commentCount = $scope.myInboxItems[i].Count_Of_Comments;
                    $scope.count = angular.element("#" + id).text();
                    if ($scope.count == $scope.commentCount)
                        angular.element("#" + id).text("");
                    else
                        angular.element("#" + id).text($scope.commentCount);
                }
            }
        }
        $scope.searchText = "";
        $scope.meeting = {
            MeetingDate: ""
        }
        $scope.orgStatus = {
            value: ""
        }

        //bind meeting Date dropdownlist
        $scope.meetingList = meetingList;

        // bind charter status dropdownlist
        $scope.charterStatus = charterStatus;
        //filter the organization based on the inboxItems
        $scope.displayInboxMessage = true;// TODO: We need to check if the user is also on the Group with view only accessibilty
        if (AuthService.isUserInGroup(USER_GROUPS.admins.replace(/['"]+/g, ''))) {// replace function to remove "" from User_group.admins
            $scope.displayInboxMessage = false;
        }
        $scope.organiztionList = $filter("filter")($scope.organiztionList, function (listItem) {
            if ($scope.organizationIDs.length > 0)
                return $scope.organizationIDs.indexOf(listItem.ID) != -1;// dispaly only the chartered and povisional-chartered organizations that are in the inbox
            if (!$scope.displayInboxMessage)// dispaly all the chartered and povisional-chartered organizations
                return true;
        });
 
        //select Charter status by default and filter the data based on this status
        $scope.orgStatus = $filter('getByFieldName')($scope.charterStatus, 'Charter', 'value');
        $scope.orgStatusProvisional = $filter('getByFieldName')($scope.charterStatus, 'Charter-Provisional', 'value');
        //$scope.gridOptions.data = $filter('filter')($scope.organiztionList, { OrgStatusName: $scope.orgStatus.value }, undefined);
        $scope.gridOptions.data = $filter('filter')($scope.organiztionList, function (data) {
            if (data.OrgStatusName == $scope.orgStatus.value || data.OrgStatusName == $scope.orgStatusProvisional.value)//: $scope.orgStatus.value
                return true;
        });

        // refresh the data based on the search and charterStatus filter
        $scope.refreshData = function () {
            $scope.refreshdataBasedOnSearch($scope.refreshCharterStatus());
        };
        //
        $scope.refreshMeetingDate = function () {
            $scope.refreshDataBymeetingDate();
        };
        //

        // filter by Organization status
        $scope.refreshCharterStatus = function () {

            if ($scope.orgStatus != null) {


                $scope.gridOptions.data = $filter('filter')($scope.organiztionList, { OrgStatusName: $scope.orgStatus.value }, undefined);
                $scope.gridOptionsOADReviewer.data = $filter('filter')($scope.organiztionList, { OrgStatusName: $scope.orgStatus.value }, undefined);
                $scope.gridOptionsOADSupervisor.data = $filter('filter')($scope.organiztionList, { OrgStatusName: $scope.orgStatus.value }, undefined);
            }

            else {
                $scope.gridOptions.data = $scope.organiztionList;
                $scope.gridOptionsOADReviewer.data = $scope.organiztionList;
                $scope.gridOptionsOADSupervisor.data = $scope.organiztionList;
            }
            //
            if ($scope.displayReviewerInboxMessage)
                return $scope.gridOptionsOADReviewer.data;
            if ($scope.displaySupervisorInboxMessage)
                return $scope.gridOptionsOADSupervisor.data;
            //
            return $scope.gridOptions.data;
        }
        // filter by PCODE , Name, RMName, or DistrictName
        $scope.refreshdataBasedOnSearch = function (data) {
            getOrgsNameForAutouComplete(data);

            if (!isNaN($scope.searchText)) {
                $scope.gridOptions.data = $filter('filter')(data, { ID: $scope.searchText }, undefined);
                $scope.gridOptionsOADReviewer.data = $filter('filter')(data, { ID: $scope.searchText }, undefined);
                $scope.gridOptionsOADSupervisor.data = $filter('filter')(data, { ID: $scope.searchText }, undefined);
            }
            else {
                $scope.gridOptions.data = $filter('filter')(data, function (item) {
                    if ($scope.searchText == undefined) {

                        return true;
                    }
                    else {
                        if (item.RMName != null && item.DistrictName != null) {
                            if (item.RMName.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1 ||
                            item.DistrictName.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1) {

                                return true;
                            }
                        }
                        if (item.Name.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1) {


                            return true;
                        }
                    }

                    return false;
                }, undefined);
                $scope.gridOptionsOADReviewer.data = $filter('filter')(data, { $: $scope.searchText, }, undefined);
                $scope.gridOptionsOADSupervisor.data = $filter('filter')(data, { $: $scope.searchText, }, undefined);
               
            }
            //$scope.gridOptionsOADReviewer.data = $filter('filter')(data, { $: $scope.searchText, }, undefined);
        }
        // filter by meeting date
        $scope.refreshDataBymeetingDate = function () {
            if ($scope.meeting != null) {
                var status = "";
                if ($scope.orgStatus != null) {
                    status = $scope.orgStatus.value;
                }

                DataService.GetOrganizationFilter($scope.meeting.ID, status).then(function (result) {
                    $scope.organiztionList = result;


                    var filteredData = $filter('filter')($scope.organiztionList, { MeetingDate: $scope.meeting.MeetingDate }, undefined);

                    $scope.gridOptions.data = filteredData;
                });
            }
            else {
                $scope.organiztionList = orgList;
                $scope.gridOptions.data = orgList;
            }

            //return $scope.gridOptions.data;


        }


        // get organizations name for kendo autocomplete 
        function getOrgsNameForAutouComplete(data) {
            var orgsName = [];
            for (var i = 0; i < data.length; i++) {
                orgsName.push(data[i].Name);
                $scope.oranizationsName = orgsName;
            }
        }
        // bind Announcements
        $scope.announcements = [];

        //uncomment the next line before pushing to prompt repo
        $scope.announcements = announcements.d.results;

        //Display Announcement
        $scope.showAnnouncementBody = false;

        // display announcement if there are not expired

        $scope.checkExpirationDate = function (index) {

            var date = new Date();
            date = date.setHours(0, 0, 0, 0);
            var announcementExpirDate = new Date($scope.announcements[index].Expires)
            if (announcementExpirDate >= date) {
                return true;
            }

            return false;
        }
        // function to strip html tags from the body of the announcement
        $scope.htmlToPlainText = function (text) {
            return angular.element(text).text();
        };
        // bind team images 

        //uncomment the next line before pushing to prompt repo
        $scope.teamIamges = teamImgList.d.results;


        // show team details
        $scope.showTeamDetails = false;

        // bind document
        //uncomment the next line before pushing to prompt repo
        $scope.documents = helpDocList.d.results;

        // mark meeting dates and premeeting date in OHTS calendar

        $scope.OHTSMeetingList = [];

        for (var i = 0; i < meetingList.length; i++) {
            var preMeetingDate = new Date();
            for (var j = 0; j < meetingList[i].MeetingMileStoneList.length; j++) {
                if (meetingList[i].MeetingMileStoneList[j].MileStoneType == 1) {// mileStoneType =1 refere to PrMeeting
                    preMeetingDate = new Date(meetingList[i].MeetingMileStoneList[j].MileStoneDate);
                    break;
                }
            }
            var todayDate = new Date().setHours(0, 0, 0, 0);
            var preOHTSmeetingtitle = "";
            var OHTSMeetingCssStyle = "";
            var preOHTSMeetingCssStyle = "";
            if (todayDate <= new Date(meetingList[i].MeetingDate)) {
                OHTSMeetingCssStyle = "futureOHTSMeeting";
                preOHTSMeetingCssStyle = "preOHTSMeeting";
                preOHTSmeetingtitle = 'PreMeeting for next OHTS meeting- ' + meetingList[i].MeetingDate;
            }

            else {
                OHTSMeetingCssStyle = "oldOHTSMeeting";
                preOHTSMeetingCssStyle = "preOldOHTSMeeting";
                preOHTSmeetingtitle = 'PreMeeting for past OHTS meeting- ' + meetingList[i].MeetingDate;
            }
            $scope.OHTSMeetingList.push({
                date: new Date(meetingList[i].MeetingDate),
                css: OHTSMeetingCssStyle,
                selectable: false,
                title: "OHTS Meeting"
            },
            {
                date: preMeetingDate,
                css: preOHTSMeetingCssStyle,
                selectable: false,
                title: preOHTSmeetingtitle
            });
        }
        $scope.OHTSMeetingList.push({
            date: new Date(),
            css: 'today',
            selectable: true,
            title: ""
        })
        // OAD Reviewer Screen 
        $scope.gridOptionsOADReviewer = {};
        $scope.gridOptionsOADReviewer = {
            //enableFiltering: true,
            data: orgList,
            columnDefs: [
                             {
                                 field: 'ID', displayName: 'Pcode', width: '9%', enableHiding: false,
                                 cellTemplate: '<a ui-sref="org.summary.workflow({ id: row.entity.ID })" class="icon-bar"><div class="ui-grid-cell-contents">{{row.entity.ID}}</div></a>'
                             },
                             {
                                 field: 'Name', displayName: 'Organization Name', width: "*", enableHiding: false,
                                 cellTemplate: '<a ui-sref="org.summary.workflow({ id: row.entity.ID })" class="icon-bar"><div class="ui-grid-cell-contents">{{row.entity.Name}}</a>' +
                                     '&nbsp&nbsp<i  class="fa fa-comment" style="color:#0A6FA0;" ng-if="grid.appScope.displayCommentCount(row.entity.ID)" ng-click="grid.appScope.setCommentCount(row.entity.ID)"></i>' +
                                     '&nbsp<span style="color:#f84358;" id="{{row.entity.ID}}"><span>'
                             },
                             { field: 'DistrictName', displayName: 'Region', width: '12%', enableHiding: false },
                             { field: 'RecordJourneyStatus', displayName: 'Assessment Status', width: '20%', enableHiding: false },
                             { field: 'AssessmentType', displayName: 'Assessment Type', width: '17%', type: 'date', cellFilter: 'date:\'MM/dd/yyyy\'', enableHiding: false },
                             {
                                 field: '', name: "Due Date", displayName: 'Due Date', width: '10%', type: 'date', cellFilter: 'date:\'MM/dd/yyyy\'', enableHiding: false,
                                 cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getDueDate(row.entity.ID)}}</div>'
                             },

            ]
        };
        if (!AuthService.isUserInGroup(USER_GROUPS.admins.replace(/['"]+/g, ''))
            && AuthService.isUserInGroup(USER_GROUPS.Reviewers)) {
            $scope.displayReviewerInboxMessage = true;
        }
        //if (AuthService.isUserInGroup(USER_GROUPS.admins.replace(/['"]+/g, '')) || !AuthService.isUserInGroup(USER_GROUPS.Reviewers)) {
        //    $scope.everyOneElse = true;
        //}
        $scope.getDueDate = function (id) {
            var dueDate = new Date();
            for (var i = 0; i < $scope.myInboxItems.length; i++) {
                if ($scope.myInboxItems[i].PCODE === id) {
                    return $scope.myInboxItems[i].DueDate;
                }
            }

        }
        $scope.gridOptionsOADReviewer.data = $filter('filter')($scope.organiztionList, function (data) {
            if (data.OrgStatusName == $scope.orgStatus.value || data.OrgStatusName == $scope.orgStatusProvisional.value)//: $scope.orgStatus.value
                return true;
        });
        //
        // OAD Supervisor Screen 
        $scope.gridOptionsOADSupervisor = {};
        $scope.gridOptionsOADSupervisor = {
            //enableFiltering: true,
            data: orgList,
            columnDefs: [
                             {
                                 field: 'ID', displayName: 'Pcode', width: '9%', enableHiding: false,
                                 cellTemplate: '<a ui-sref="org.summary.workflow({ id: row.entity.ID })" class="icon-bar"><div class="ui-grid-cell-contents">{{row.entity.ID}}</div></a>'
                             },
                             {
                                 field: 'Name', displayName: 'Organization Name', width: "*", enableHiding: false,
                                 cellTemplate: '<a ui-sref="org.summary.workflow({ id: row.entity.ID })" class="icon-bar"><div class="ui-grid-cell-contents">{{row.entity.Name}}</a>' +
                                     '&nbsp&nbsp<i  class="fa fa-comment" style="color:#0A6FA0;" ng-if="grid.appScope.displayCommentCount(row.entity.ID)" ng-click="grid.appScope.setCommentCount(row.entity.ID)"></i>' +
                                     '&nbsp<span style="color:#f84358;" id="{{row.entity.ID}}"><span>'
                             },
                             { field: 'DistrictName', displayName: 'Region', width: '12%', enableHiding: false },
                             { field: 'RecordJourneyStatus', displayName: 'Assessment Status', width: '20%', enableHiding: false },
                             { field: 'AssessmentType', displayName: 'Assessment Type', width: '16%',  enableHiding: false },
                             { field: 'AssessmentDate', displayName: 'Assessment Date', width: '15%', type: 'date', cellFilter: 'date:\'MM/dd/yyyy\'', enableHiding: false },
                             {
                                 field: '', name: "Due Date", displayName: 'Due Date', width: '10%', type: 'date', cellFilter: 'date:\'MM/dd/yyyy\'', enableHiding: false,
                                 cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getDueDate(row.entity.ID)}}</div>'
                             },

            ]
        };
        if (!AuthService.isUserInGroup(USER_GROUPS.admins.replace(/['"]+/g, ''))
            && AuthService.isUserInGroup(USER_GROUPS.OAD_Staff)) {
            $scope.displaySupervisorInboxMessage = true;
        }
        if (AuthService.isUserInGroup(USER_GROUPS.admins.replace(/['"]+/g, '')))
            $scope.everyOneElse = true;
        if ((!AuthService.isUserInGroup(USER_GROUPS.OAD_Staff) && !AuthService.isUserInGroup(USER_GROUPS.Reviewers))) {
            $scope.everyOneElse = true;
        }
        $scope.getDueDate = function (id) {
            var dueDate = new Date();
            for (var i = 0; i < $scope.myInboxItems.length; i++) {
                if ($scope.myInboxItems[i].PCODE === id) {
                    return $scope.myInboxItems[i].DueDate;
                }
            }

        }
        $scope.gridOptionsOADSupervisor.data = $filter('filter')($scope.organiztionList, function (data) {
            if (data.OrgStatusName == $scope.orgStatus.value || data.OrgStatusName == $scope.orgStatusProvisional.value)//: $scope.orgStatus.value
                return true;
        });

        //
    }]);

});