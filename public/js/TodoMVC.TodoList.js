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
			this.TodoCollection = App.TodoCollection;
		},

		// что будет выполняться при старте
		start: function(){
			
			var self = this;
			// запускаем функцию представления значка загрузки покуда коллекция фетчится
			App.TodoCollection.on('request', function(){
				// console.log('request is happened');				
				self.showLoading();
			});
			// когда все модели удачно синхронизированны с сервером, можно показывать
			App.TodoCollection.on('sync', function(){
				// console.log('sync is happened');
				// псевдо-время загрузки с сервера
				_.delay(function(){
					App.root.getRegion('popup').empty();
					// каждая следующая строчка - это вызов функции находящейся в контроллере
					// которая в свою очередь запускает отведенное ей представление
					self.showHeader(self.TodoCollection);
					self.showMain(self.TodoCollection);
					self.showFooter(self.TodoCollection);
				}, 500);
			});
			// фетчим нашу коллекцию с сервера
			
			self.TodoCollection.fetch();
		},

		showLoading: function(TodoCollection){
			// создфли экземпляр представления хедера и передали ему коллекцию
			var loading = new Backbone.Marionette.ItemView({
				className: 'please-waite',
				template: '#loading-circle',
			});
			// Вставляем наш экземпляр представления header в регион под названием header
			App.root.showChildView('popup', loading);
		},

		showHeader: function(TodoCollection){
			// создфли экземпляр представления хедера и передали ему коллекцию
			var header = new App.AppStaticLayout.Header({
				collection: TodoCollection,
			});
			// Вставляем наш экземпляр представления header в регион под названием header
			App.root.showChildView('header', header);
		},

		showMain: function(TodoCollection){
			// создфли экземпляр представления main и передали ему коллекцию
			var main = new App.TodoList.Views.ListVews({
				collection: TodoCollection,
			});
			// Вставляем наш экземпляр представления main в регион под названием main
			App.root.showChildView('main', main);					
		},

		showFooter: function(TodoCollection){
			// создфли экземпляр представления footer и передали ему коллекцию
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

		// Функция обработки значения роута
		LoadApp: function(route){
			// route - текущее значение роута
			// если был указан роут, который соответствует следующему значению
			// очистим всю страницу
			if(route === 'author_page') {
				var authorPage = new App.AppStaticLayout.AuthorPage();
				this.hideAll();
				App.root.getRegion('header').show(authorPage);		
			} else if(route === 'home'){
				MyApp.request('filterState').set('filter', 'all');
				// управление главным инпутом
				MyApp.request('filterState').set('generalInput', true);
				this.start();
			} else {
				// значение фильтра до изменения
				// console.log(MyApp.request('filterState').get('filter'));
				// управление отображение главного поля ввода модели
				if(route === 'all') {
					MyApp.request('filterState').set('generalInput', true);
				} else{
					MyApp.request('filterState').set('generalInput', false);
				}

				// изменяем значение фильтра
				MyApp.request('filterState').set('filter', route);						
				
				// значение фильтра после изменения
				// console.log(MyApp.request('filterState').get('filter'));
			}
		}
	});


	// Одна из самых главных частей всего приложения - общий старт
	MyApp.on('start', function(){
		// создаем экземпляр контроллера
		var controller = new TodoList.Controller();
		//указываем экземпляр роутера
		controller.router = new TodoList.Router({
			// указали контроллер который относится к этому роуту
			controller : controller,
		});

		// стартовали контроллер
		controller.start();
	});
});