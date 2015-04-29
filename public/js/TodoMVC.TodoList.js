/*global Backbone */
'use strict';

MyApp.module('TodoList', function(TodoList, App, Backbone){	

	// создаем обьект роут
	TodoList.Router = Marionette.AppRouter.extend({		
		// задали роут
		appRoutes: {
			// *route - любое значение роута. Вычисление представления будет происходить в указанной функцие
			'*route': 'LoadApp'
		},
	});

	// создаем контроллер для нашего роута
	TodoList.Controller = Marionette.Controller.extend({
		// создаем коллекцию для наших вьюх
		initialize: function(){
			// задаем коллекцию одну для всего приложения
			MyApp.TodoCollection = new MyApp.Todos.TodoCollection();
			this.TodoCollection = MyApp.TodoCollection;
		},		

		showHeader: function(TodoCollection){
			// создали экземпляр представления хедера и передали ему коллекцию
			var header = new App.AppStaticLayout.Header({
				collection: TodoCollection,
			});
			// Вставляем наш экземпляр представления header в регион под названием header
			App.root.showChildView('header', header);
		},

		showMain: function(TodoCollection){
			// создали экземпляр представления main и передали ему коллекцию
			var main = new App.TodoList.Views.ListVews({
				collection: TodoCollection,
			});
			// Вставляем наш экземпляр представления main в регион под названием main
			App.root.showChildView('main', main);					
		},

		showFooter: function(TodoCollection){
			// создали экземпляр представления footer и передали ему коллекцию
			var footer = new App.AppStaticLayout.Footer({
				collection: TodoCollection,
			});
			// Вставляем наш экземпляр представления footer в регион под названием footer
			App.root.showChildView('footer', footer);
		},

		// очистка регионов
		hideAll: function(){
			App.root.getRegion('header').empty();
			App.root.getRegion('main').empty();
			App.root.getRegion('footer').empty();
		},

		//general show
		showAll: function(){
			this.showHeader(this.TodoCollection);
			this.showMain(this.TodoCollection);
			this.showFooter(this.TodoCollection);
		},

		// Функция обработки значения роута
		LoadApp: function(route){
			// alert('i am route '+'+'+route+'+');
			// изменяем значение фильтра
			MyApp.request('filterState').set('filter', route);
			// действие для роута
			switch(route) {
			    case 'author_page':
			        var authorPage = new App.AppStaticLayout.AuthorPage();
					this.hideAll();
					App.root.getRegion('header').show(authorPage);
			        break;
			    
			    case null:
			        Backbone.history.navigate('/all', {replace: false, trigger: true});
			        break;
			    
			    case 'all':
			    	App.request('filterState').set('generalInput', true);
			    	this.showAll();			        
			        break;

			    // код для роута done тот же что и для have-to-do
			    case 'done':								    
			    case 'have-to-do':
			    	App.request('filterState').set('generalInput', false);
			        this.showAll();
			        break;
			        
			    default:
			        var authorPage = new App.AppStaticLayout.AuthorPage({
						template: '#layout-404'
					});
					this.hideAll();
					App.root.getRegion('header').show(authorPage);
				};
			}
		});

	$( document ).ready(function() {
    	var controller = new TodoList.Controller();
		var router = new TodoList.Router({
			controller: controller,
		});
	});

	// Одна из самых главных частей всего приложения - общий старт
	MyApp.on('start', function(){

			var showLoading = function(){
				// создали экземпляр загрузки
				var loading = new Backbone.Marionette.ItemView({
					className: 'please-waite',
					template: '#loading-circle',
				});
				// Вставляем наш экземпляр представления loading в регион под названием popup
				App.root.showChildView('popup', loading);
			};

			// запускаем функцию представления значка загрузки покуда коллекция фетчится
			MyApp.TodoCollection.on('request', function(){
				console.log('request is happened');				
				showLoading();
			});
			// когда все модели удачно синхронизированны с сервером, можно показывать
			MyApp.TodoCollection.on('sync', function(){
				console.log('sync is happened');
				// псевдо-время загрузки с сервера
				_.delay(function(){
					App.root.getRegion('popup').empty();					
				}, 1000);
			});
			// фетчим нашу коллекцию с сервера
			MyApp.TodoCollection.fetch();
	});
});