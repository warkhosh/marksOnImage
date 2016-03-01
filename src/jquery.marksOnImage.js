(function ($) {
    $.fn.marksOnImage = function (options) {
        var option = $.extend({
            cords: [],
            newCords: [],
            index: null,
            method: 'edit',
            dotName: 'dot',
            readOnly: true,
            idCoordinateX: null,
            idCoordinateY: null,
            maxCoordinateX: 0,
            maxCoordinateY: 0,
            markWidth: 0,
            markHeight: 0,
            modalWidth: 0,
            coordinateX: null, // координаты для позиционирования метки
            coordinateY: null, // координаты для позиционирования метки
            left: null, // координаты для корретного размщения метки с учётом сдвига
            top: null   // координаты для корретного размщения метки с учётом сдвига
        }, options);

        var elem = {
            node: null,
            img: null,
            image: null,
            modal: null,
            inputCoordinateY: null,
            inputCoordinateX: null
        };

        /**
         * Создание элемента метки
         * @param id
         * @param className
         * @param index
         * @returns {*|HTMLElement}
         */
        var mark = function (id, className, index) {
            className = className || '';
            index = Number(index) >= 0 ? Number(index) : null;

            var elem = $('<span class="dot ' + className + '"><i></span>');

            if (index != null) {
                elem.data('index', index);
            }
            if (id) elem.attr('id', id);

            return elem;
        };

        /**
         * Создание элемента метки с указанием названия
         *
         * @param id
         * @param className
         * @param index
         * @returns {*|HTMLElement}
         */
        var markChange = function (id, className, index, text) {
            var elem = mark(id, className, index);
            elem.on('click', activeMark).find('i').replaceWith('<b>'+text+'</b>');
            readOnly(false);
            return elem;
        };

        /**
         * Отрисовка иконки метки.
         * Для получение её размеров с целью использовать их для центрирования метки по центру клика.
         */
        var markSize = function () {
            $('body').append($('<div>').hide().append(mark('cmsyuwmbgwcgassqgpv')));

            var e = $('#cmsyuwmbgwcgassqgpv');
            option.markWidth = e.width();
            option.markHeight = e.height();
        };

        var cancelClick = function (e) {
            e.preventDefault();
            return false;
        };

        var activeMark = function (e) {
            if (option.method == 'changeAllCoordinates') {
                elem.modal.find('.dot.select').attr('class', 'dot fa fa-male');
                option.index = $(this).attr('class', 'dot fa fa-street-view select').data('index');
            }
            e.preventDefault();
            return false;
        };

        var readOnly = function (value) {
            option.readOnly = value;
            elem.inputCoordinateY.prop("readonly", value);
            elem.inputCoordinateX.prop("readonly", value);
        };

        var removeMark = function (e) {
            e.preventDefault();
            $(this).parent().remove();
            elem.inputCoordinateY.val(null);
            elem.inputCoordinateX.val(null);
            return false;
        };

        /**
         * Триггер для смещения иконки по изменившимся координатам в input полях.
         */
        var changeCoordinate = function () {
            coordinates(elem.inputCoordinateY.val(), elem.inputCoordinateX.val());

            elem.inputCoordinateY.val(option.coordinateY);
            elem.inputCoordinateX.val(option.coordinateX);

            var dot = elem.node.find('.dot.select');
            dot.css({'top': option.top, 'left': option.left});
        };

        /**
         * Проверка координат и высчитывание смещения для позиционирования иконки по координатам.
         * Результат вычислений записывается в объект: option
         * @param {String|Number} y
         * @param {String|Number} x
         */
        var coordinates = function (y, x) {
            y = Number(y);
            x = Number(x);

            // Размеры метки для получения сдвига
            var markWidth = option.markWidth;
            var markHeight = option.markHeight;
            var mark2Width = (markWidth / 2);
            var mark2Height = (markHeight / 2);

            // Смещаем кординаты для установки метки по центру клика
            var top = (y - mark2Height);
            var left = (x - mark2Width);

            // Проверки для предотвращения установки метки за пределами схемы
            if (top < 1) top = 0;
            if (left < 1) left = 0;

            if ((y + mark2Height) > option.maxCoordinateY) top = (option.maxCoordinateY - markHeight);
            if ((x + mark2Width) > option.maxCoordinateX) left = (option.maxCoordinateX - markWidth);

            // записываем значения для использования в других местах
            option.top = top;
            option.left = left;

            option.coordinateY = (top + mark2Height);
            option.coordinateX = (left + mark2Width);
        };

        /**
         * Создание и отрисовка метки по координатам от клика мыши.
         * @param {Event} e
         */
        var createMark = function (e) {
            if (option.readOnly) return false;

            coordinates(e.offsetY, e.offsetX);

            // Убираем (если есть) метку перед отрисовкой новой
            elem.node.find('.dot.select').remove();

            var id = option.dotName + option.index;
            if (option.method == 'changeAllCoordinates') {
                //var dot = markChange(id, 'fa fa-street-view select', option.index, 'ddsdsffds'); // новая метка
            } else {
                var dot = mark(id, 'fa fa-street-view select', option.index); // новая метка
            }

            dot.css({'top': option.top, 'left': option.left});
            dot.attr('class', 'dot fa fa-street-view select');

            elem.node.append(dot);

            elem.inputCoordinateY.val(option.coordinateY);
            elem.inputCoordinateX.val(option.coordinateX);

            dot.on('click', cancelClick);     // Клик мышкой по метке
            dot.on('click', 'i', removeMark); // Клик по елементу удаления метки

            if (option.method == 'changeAllCoordinates') {
                dot.on('click', activeMark);
            }
        };

        var moveMark = function (e) {
            console.log(e);
        };

        /**
         * Центрирование схемы в модальном окне
         */
        var imageOffset = function () {
            var position = elem.modal.find('.modal-body > div').position();
            option.modalWidth = elem.modal.children().width();

            // Центровка картинки в модальном окне:
            if ((option.maxCoordinateX + (position.left * 2)) < option.modalWidth) {
                var left = (((option.modalWidth - option.maxCoordinateX) + position.left) / 2);
                elem.node.css('margin-left', left);
            } else {
                elem.node.removeAttr('style');
            }
        };

        // Вызывается до запуска основного метода
        var beforeMethod = function () {
            // Записываем размеры картинки для предотвращения указание координат за их пределом
            option.maxCoordinateX = elem.image.width;
            option.maxCoordinateY = elem.image.height;

            imageOffset();

            // показываем картинку и записываем ключь текущей метки
            elem.node.find('img').data('index', option.index);
        };

        // Вызывается после запуска основного метода
        var afterMethod = function () {
            elem.node.css('visibility', 'visible');
            $(window).resize(imageOffset); // Триггер на смещение картинки в модальном окне если она меньше его
        };

        /**
         * @param {Array} list
         * @returns {Array}
         */
        var getSchemes = function (list) {
            var data = {};

            for (var i = 0; i < list.length; i++) {
                var top = 0, left = 0;
                option.newCords[i] = null;

                if (option.cords[i].on_scheme) {
                    var scheme = option.cords[i].on_scheme;

                    if (option.cords[i].not_active) continue;

                    if (scheme == null) scheme = '';
                    // Если придёт что-то другое то мы его превратим в строчку
                    scheme = scheme.toString();

                    // если без разделителя
                    if (scheme.indexOf(',') < 1) {
                        scheme = '';
                    }

                    var cord = scheme.split(',');

                    if (cord.length >= 1) {
                        var y = Number(cord[0]);
                        top = isNaN(y) ? 0 : y;
                    }

                    if (cord.length == 2) {
                        var x = Number(cord[1]);
                        left = isNaN(x) ? 0 : x;
                    }

                    coordinates(top, left);

                    data[i] = {
                        top: option.top,
                        left: option.left,
                        coordinateY: option.coordinateY,
                        coordinateX: option.coordinateX,
                        name: list[i].name && list[i].name.ru ? list[i].name.ru : '',
                        not_active: list[i].not_active && list[i].not_active === true ? true : false
                    };
                }
            }

            return data;
        };

        // Метод Edit
        var edit = function () {
            beforeMethod();

            var coordinates = getSchemes(option.cords);

            // Перебираем все метки для их отрисовывания
            $.each(coordinates, function (index, value) {
                var id = option.dotName + index;
                var dot = mark(id, option.index == index ? 'fa fa-street-view select' : 'fa fa-male', index);

                dot.css('top', value.top);
                dot.css('left', value.left);

                if (option.index == index) {
                    elem.inputCoordinateY.val(value.coordinateY);
                    elem.inputCoordinateX.val(value.coordinateX);
                    if (!value.not_active) readOnly(false);
                } else {
                    dot.css('opacity', '0.6');
                }

                dot.on('click', cancelClick);     // Клик мышкой по метке
                dot.on('click', 'i', removeMark); // Клик по елементу удаления метки

                if (!value.not_active) elem.node.append(dot);

                // Записываем координаты
                option.newCords[index] = value.coordinateY + ',' + value.coordinateX;
            });

            elem.node.click(createMark);  // Событие размещения метки по клику на картинке

            afterMethod();
        };

        // Метод ChangeAllCoordinates
        var changeAllCoordinates = function () {
            beforeMethod();

            var coordinates = getSchemes(option.cords);

            // Перебираем все метки для их отрисовывания
            $.each(coordinates, function (index, value) {
                var id = option.dotName + index;
                var dot = markChange(id, option.index == index ? 'fa fa-street-view select' : 'fa fa-male', index, value.name);

                dot.css('top', value.top);
                dot.css('left', value.left);

                if (option.index == index) {
                    elem.inputCoordinateY.val(value.coordinateY);
                    elem.inputCoordinateX.val(value.coordinateX);
                    if (!value.not_active) readOnly(false);
                } else {
                    dot.css('opacity', '0.6');
                }

                dot.on('click', activeMark);       // Клик мышкой по метке
                dot.on('click', 'i', cancelClick); // Клик по елементу удаления метки

                if (!value.not_active) elem.node.append(dot);

                // Записываем координаты
                option.newCords[index] = value.coordinateY + ',' + value.coordinateX;
            });

            elem.node.click(moveMark);  // Событие размещения метки по клику на картинке

            afterMethod();
        };

        var app = function () {
            elem.node = $('#schemeMap');
            elem.modal = $('#schemeModal');
            elem.inputCoordinateY = $(option.idCoordinateY);
            elem.inputCoordinateX = $(option.idCoordinateX);

            var close = elem.modal.find('.close');

            if (option.method == 'changeAllCoordinates') {
                close.hide();
            } else {
                close.show();
            }

            // Заполняем поля координат значениями по умолчанию
            elem.inputCoordinateY.val(null).change(changeCoordinate);
            elem.inputCoordinateX.val(null).change(changeCoordinate);

            // Удаляем все точки для отрисовки новых
            elem.node.find('.dot').remove();

            // Выясняю размеры иконки
            markSize();

            elem.image = new Image();

            // Запускаем сценарий после загрузки картинки
            if (option.method == 'changeAllCoordinates') {
                elem.image.onload = changeAllCoordinates;
            } else {
                elem.image.onload = edit;
            }

            elem.image.src = elem.node.find('.scheme').attr('src');
        };

        return this.each(app);
    };

})(jQuery);