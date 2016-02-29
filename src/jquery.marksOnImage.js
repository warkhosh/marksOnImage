(function ($) {
    $.fn.marksOnImage = function (options) {
        var option = $.extend({
            cords: [],
            index: null,
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

        // Создание элемента отметки
        var mark = function (id, className) {
            className = className || '';
            var elem = $('<span class="dot ' + className + '"><i></span>');
            if (id) elem.attr('id', id);
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

            //coordinates(option.top, option.left);

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
        var coordinates = function(y, x) {
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
            var dot = mark(id, 'fa fa-street-view select'); // новая метка

            dot.css({'top': option.top, 'left': option.left});
            dot.attr('class', 'dot fa fa-street-view select');

            elem.node.append(dot);

            elem.inputCoordinateY.val(option.coordinateY);
            elem.inputCoordinateX.val(option.coordinateX);

            dot.on('click', cancelClick);     // Клик мышкой по метке
            dot.on('click', 'i', removeMark); // Клик по елементу удаления метки
        };

        /**
         * Центрирование схемы в модальном окне
         */
        var imageOffset = function () {
            var position = elem.modal.find('.modal-body > div').position();
            option.modalWidth = elem.modal.children().width();

            // Центровка картинки в модальном окне:
            if ((option.maxCoordinateX + (position.left*2)) < option.modalWidth) {
                var left = (((option.modalWidth - option.maxCoordinateX) + position.left) / 2);
                elem.node.css('margin-left', left);
            } else {
                elem.node.removeAttr('style');
            }
        };

        var start = function () {
            elem.node = $('#schemeMap');
            elem.modal = $('#schemeModal');
            elem.inputCoordinateY = $(option.idCoordinateY);
            elem.inputCoordinateX = $(option.idCoordinateX);

            // Заполняем поля координат значениями по умолчанию
            elem.inputCoordinateY.val(null).change(changeCoordinate);
            elem.inputCoordinateX.val(null).change(changeCoordinate);

            // Удаляем все точки для отрисовки новых
            elem.node.find('.dot').remove();

            markSize();

            elem.image = new Image();
            elem.image.src = elem.node.find('.scheme').attr('src');

            // Запускаем сценарий после загрузки картинки:
            elem.image.onload = function () {
                // Записываем размеры картинки для предотвращения указание координат за их пределом
                option.maxCoordinateX = elem.image.width;
                option.maxCoordinateY = elem.image.height;

                imageOffset();

                // показываем картинку и записываем ключь текущей метки
                elem.node.find('img').data('index', option.index);

                // Перебираем все метки для их отрисовывания
                for (var i = 0; i < option.cords.length; i++) {
                    var top = 0, left = 0;
                    var scheme = option.cords[i].on_scheme;

                    if (!option.cords[i].on_scheme) scheme = null;
                    if (scheme === null) scheme = '';

                    // А если придёт что-то другое:
                    scheme = scheme.toString();

                    // если без разделителя
                    if (scheme.indexOf(',') < 1) {
                        scheme = '';
                    }

                    if (scheme != '') {
                        var id = option.dotName + i;
                        var dot = mark(id, option.index == i ? 'fa fa-street-view select' : 'fa fa-male');
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

                        dot.css('top', option.top);
                        dot.css('left', option.left);

                        if (option.index == i) {
                            elem.inputCoordinateY.val(option.coordinateY);
                            elem.inputCoordinateX.val(option.coordinateX);
                            if (!option.cords[i].not_active) readOnly(false);
                        } else {
                            dot.css('opacity', '0.6');
                        }

                        dot.on('click', cancelClick);     // Клик мышкой по метке
                        dot.on('click', 'i', removeMark); // Клик по елементу удаления метки

                        if (!option.cords[i].not_active) elem.node.append(dot);
                    } else {
                        if (option.index == i) readOnly(false);
                    }
                }

                elem.node.css('visibility', 'visible');

                elem.node.click(createMark);  // Событие размещения метки по клику на картинке
                $(window).resize(imageOffset); // Триггер на смещение картинки в модальном окне если она меньше его
            };
        };

        return this.each(start);
    };

})(jQuery);
//# sourceMappingURL=marksOnImage.js.map
