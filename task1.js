// The array follows the picture: guests are stored from left to right.
const originalParty = [
  { id: 'balcony', name: 'Balcony', floor: 2, guests: [
    ['Aigerim', 'green', '20:45', true, ['cup', 'crumbs']],
    ['Aliya', 'black', '21:15', false, ['phone', 'cup']],
    ['Madina', 'green', '22:10', false, ['phone', 'bag', 'crumbs']],
    ['Ivan', 'black', '20:10', true, ['cup']]
  ]},
  { id: 'hall', name: 'Hall', floor: 2, guests: [
    ['Arman', 'yellow', '20:35', false, ['bag', 'glasses']],
    ['Sophia', 'purple', '21:20', true, ['phone']],
    ['Dias', 'green', '19:45', true, []],
    ['Bekzat', 'purple', '20:55', false, ['bag', 'cup', 'crumbs']],
    ['Aruzhan', 'blue', '21:50', true, ['phone']],
    ['Saule', 'green', '21:25', false, ['glasses']]
  ]},
  { id: 'kitchen', name: 'Kitchen', floor: 1, guests: [
    ['Nurlan', 'red', '19:40', true, ['phone', 'cup']],
    ['Emma', 'black', '20:15', false, ['bag']],
    ['Timur', 'green', '21:05', true, ['phone', 'bag', 'crumbs']],
    ['Sergey', 'yellow', '20:50', false, []],
    ['Yerlan', 'red', '21:40', true, ['glasses', 'phone']],
    ['Kamila', 'green', '20:05', false, ['cup']]
  ]},
  { id: 'living-room', name: 'Living room', floor: 1, guests: [
    ['Daniel', 'blue', '19:55', true, ['glasses']],
    ['Zarina', 'green', '21:10', false, ['bag', 'phone', 'crumbs']],
    ['Natasha', 'yellow', '20:30', true, []],
    ['Askar', 'black', '21:00', true, ['phone']],
    ['Inkar', 'purple', '20:20', false, ['bag']]
  ]}
];
let party = $.extend(true, [], originalParty);
const icons = { phone: '📱', glasses: '👓', bag: '👜', cup: '☕', crumbs: '🍰' };
const colors = { red: '#d74b55', blue: '#4775ce', green: '#368761', black: '#292e35', yellow: '#e2ac21', purple: '#9455bf' };
const caseTitles = [
  'Who is in the hall?', 'Yellow or purple clothes', 'AITU students upstairs',
  'Glasses or a bag', 'Nothing at all', 'Phone but no bag', 'Arrival 20:30–21:00 inclusive',
  'After 21:00, not AITU', 'Right next to Askar', 'Last in each room', 'Third in each room',
  'After Timur', 'Right before someone in black', 'Room with Aruzhan', 'Rooms with fewer than 6 guests',
  'Rooms with a cup but no glasses', 'First arrival in each room', 'Miras joins between Askar and Inkar',
  'Natasha goes home', 'Who took the cake?'
];

function guestCard(g) {
  const [name, color, time, aitu, things] = g;
  const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const card = $('<div>').addClass('guest ' + color + (aitu ? ' aitu' : ''))
    .attr({ 'data-name': name, 'data-time': time, 'data-minutes': minutes,
      'data-things': things.join(' '), tabindex: 0, 'aria-label': name })
    .css('--clothing', colors[color]);
  $('<img>').addClass('avatar').attr({ src: 'avatars/' + name + '.svg', alt: name }).appendTo(card);
  if (aitu) $('<span>').addClass('badge').text('🎓').attr('title', 'AITU student').appendTo(card);
  $('<strong>').addClass('name').text(name).appendTo(card);
  $('<span>').addClass('time').text(time).appendTo(card);
  const items = $('<div>').addClass('things').appendTo(card);
  things.forEach(thing => $('<span>').addClass('thing ' + thing).attr('title', thing).text(icons[thing]).appendTo(items));
  return card;
}

function buildParty() {
  $('#house').empty();
  [2, 1].forEach(floor => {
    const level = $('<section>').addClass('floor').attr('data-floor', floor).appendTo('#house');
    $('<h2>').addClass('floor-label').text('Floor ' + floor).appendTo(level);
    party.filter(room => room.floor === floor).forEach(room => {
      const section = $('<section>').addClass('room').attr({ id: room.id, 'data-room': room.name }).appendTo(level);
      const heading = $('<div>').addClass('room-heading').appendTo(section);
      $('<h3>').text(room.name).appendTo(heading);
      if ($('body').hasClass('task2')) $('<button>').addClass('sort').text('Sort by time').appendTo(heading);
      const guests = $('<div>').addClass('guests').appendTo(section);
      room.guests.forEach(g => guestCard(g).appendTo(guests));
    });
  });
}

// Each case searches the DOM with a single jQuery chain.
const cases = [
  () => $('#hall .guest'),
  () => $('.guest.yellow, .guest.purple'),
  () => $('.floor[data-floor="2"] .guest.aitu'),
  () => $('.guest:has(.glasses), .guest:has(.bag)'),
  () => $('.guest[data-things=""]'),
  () => $('.guest:has(.phone):not(:has(.bag))'),
  () => $('.guest').filter(function () { return $(this).data('minutes') >= 1230 && $(this).data('minutes') <= 1260; }),
  () => $('.guest:not(.aitu)').filter(function () { return $(this).data('minutes') > 1260; }),
  () => $('.guest[data-name="Askar"]').prev('.guest').add($('.guest[data-name="Askar"]').next('.guest')),
  () => $('.guest:last-child'),
  () => $('.guest:nth-child(3)'),
  () => $('.guest[data-name="Timur"]').nextAll('.guest'),
  () => $('.guest.black').prev('.guest'),
  () => $('.guest[data-name="Aruzhan"]').closest('.room'),
  () => $('.room').filter(function () { return $(this).find('.guest').length < 6; }),
  () => $('.room:has(.cup):not(:has(.glasses))'),
  () => $('.guest').filter(function () { return $(this).siblings('.guest').filter((i, other) => Number($(other).attr('data-minutes')) < Number($(this).attr('data-minutes'))).length === 0; }),
  () => guestCard(['Miras', 'blue', '21:20', true, ['phone']]).hide().insertAfter($('.guest[data-name="Askar"]')).fadeIn(350),
  () => $('.guest[data-name="Natasha"]').fadeOut(350, function () { $(this).remove(); }),
  () => $('.floor[data-floor="1"] .guest:has(.crumbs):not(:has(.cup))').filter(function () { return $(this).data('minutes') > 1260 && $(this).data('minutes') < 1290; }).filter(function () { return $(this).prev('.guest').add($(this).next('.guest')).is('.aitu'); })
];

function markResult(found, number) {
  $('.selected').removeClass('selected');
  found.addClass('selected');
  const names = found.map(function () { return $(this).attr('data-name') || $(this).attr('data-room'); }).get();
  $('#result').text('Case ' + number + ': ' + names.length + ' found — ' + names.join(', ') + (number === 19 ? ' (left the party)' : ''));
  $('#chain').text(cases[number - 1].toString().replace(/^\(\) => /, ''));
  found.filter('.guest').animate({ top: -12 }, 140).animate({ top: 0 }, 140);
  return found;
}

function runCase(number) {
  if (window.finishMotion) window.finishMotion();
  if (number === 18) party.forEach(room => { room.guests = room.guests.filter(g => g[0] !== 'Miras'); });
  buildParty();
  $('#cases button').removeClass('active').filter('[data-case="' + number + '"]').addClass('active');
  const found = markResult(cases[number - 1](), number);
  if (window.spotlight) window.spotlight(found);
  // Keep Task 2's array consistent with the two DOM-changing cases.
  if ($('body').hasClass('task2') && number === 18) {
    party.forEach(room => { room.guests = room.guests.filter(g => g[0] !== 'Miras'); });
    const room = party.find(room => room.guests.some(g => g[0] === 'Askar'));
    room.guests.splice(room.guests.findIndex(g => g[0] === 'Askar') + 1, 0, ['Miras', 'blue', '21:20', true, ['phone']]);
  }
  if ($('body').hasClass('task2') && number === 19) party.forEach(room => { room.guests = room.guests.filter(g => g[0] !== 'Natasha'); });
  return found;
}

$(function () {
  caseTitles.forEach((title, i) => $('<button>').attr({ 'data-case': i + 1, title: title }).text(i + 1).appendTo('#cases'));
  $('#cases').on('click', 'button', function () { runCase(Number($(this).attr('data-case'))); });
  $('#clear').on('click', function () {
    if (window.finishMotion) window.finishMotion();
    party = $.extend(true, [], originalParty);
    buildParty();
    $('#cases button').removeClass('active');
    $('#result').text('Party reset. All guests are bright.');
    $('#chain').text('Choose a case.');
  });
  buildParty();
});
