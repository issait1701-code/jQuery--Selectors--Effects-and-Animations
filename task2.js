// Task 2 adds effects to the copied Task 1 page.
let detailGuest = null;
let motionBusy = false;

function avatarBox(guest) {
  const avatar = guest.find('.avatar');
  const offset = avatar.offset();
  return { left: offset.left - $(window).scrollLeft(), top: offset.top - $(window).scrollTop(), width: 62, height: 62 };
}

function closeDetail(done) {
  const panel = $('#guest-detail');
  if (!panel.length) { if (done) done(); return; }
  panel.stop(true, true).animate(avatarBox(detailGuest), 180, function () {
    panel.remove();
    $('#overlay').remove();
    detailGuest = null;
    if (done) done();
  });
}

// Complete current effects before handling another action. There are no queued repeats.
window.finishMotion = function () {
  for (let i = 0; i < 4; i++) $(':animated').stop(true, true);
  $('#guest-detail, #overlay').remove();
  detailGuest = null;
  motionBusy = false;
};

window.spotlight = function (found) {
  const bright = found.filter('.guest').add(found.filter('.room').find('.guest'));
  $('.guest').not(bright).stop(true, true).fadeTo(300, 0.2);
  bright.stop(true, true).css('top', 0).fadeTo(300, 1)
    .animate({ top: -12 }, 140).animate({ top: 0 }, 140);
};

function openDetail(guest) {
  detailGuest = guest;
  const name = guest.attr('data-name');
  const room = party.find(room => room.guests.some(g => g[0] === name));
  const data = room.guests.find(g => g[0] === name);
  $('<div>').attr('id', 'overlay').appendTo('body');
  const panel = $('<section>').attr({ id: 'guest-detail', role: 'dialog', 'aria-label': name, 'aria-modal': 'true' })
    .css(avatarBox(guest)).appendTo('body');
  $('<h2>').text(name).appendTo(panel);
  $('<p>').text('Wears ' + data[1] + '. Came at ' + data[2] + '.').appendTo(panel);
  $('<p>').text(data[3] ? 'AITU student.' : 'Not an AITU student.').appendTo(panel);
  const words = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
  $('<p>').text(data[4].length ? 'Has ' + data[4].map(thing => words[thing]).join(' and ') + '.' : 'Has nothing.').appendTo(panel);
  $('<p>').text('Room: ' + room.name + ', floor ' + room.floor + '.').appendTo(panel);
  const moves = $('<div>').addClass('moves').appendTo(panel);
  party.filter(other => other.id !== room.id).forEach(other => $('<button>').attr('data-move', other.id).text('Move to ' + other.name.toLowerCase()).appendTo(moves));
  $('<button>').addClass('close-detail').text('Close (Esc)').appendTo(panel);
  const width = Math.min(360, $(window).width() - 24);
  panel.animate({ width: width, height: 295, left: ($(window).width() - width) / 2,
    top: Math.max(12, ($(window).height() - 295) / 2) }, 240);
}

function moveGuest(guest, roomId) {
  window.finishMotion();
  const name = guest.attr('data-name');
  const source = party.find(room => room.guests.some(g => g[0] === name));
  const target = party.find(room => room.id === roomId);
  const data = source.guests.find(g => g[0] === name);
  source.guests = source.guests.filter(g => g[0] !== name);
  target.guests.push(data);
  // The array keeps picture order, with moved guests at the end of the new room.
  const from = guest.offset();
  const width = guest.outerWidth();
  const height = guest.outerHeight();
  const flying = guest.clone().removeClass('selected').addClass('flying')
    .css({ left: from.left, top: from.top, width: width, height: height, opacity: 1 }).appendTo('body');
  const oldPlace = $('<div>').addClass('placeholder').css({ width: width, height: height }).insertBefore(guest);
  const newPlace = $('<div>').addClass('placeholder').css({ width: 0, height: height }).appendTo('#' + roomId + ' .guests');
  guest.detach();
  motionBusy = true;
  oldPlace.animate({ width: 0 }, 220, function () { oldPlace.remove(); });
  newPlace.animate({ width: width }, 220, function () {
    const to = newPlace.offset();
    flying.animate({ left: to.left, top: to.top }, 420, function () {
      newPlace.replaceWith(guest.css({ opacity: 1, top: 0, left: 0 }));
      flying.remove();
      motionBusy = false;
      $('#result').text(name + ' moved to ' + target.name + '.');
    });
  });
}

function sortRoom(roomElement) {
  window.finishMotion();
  const room = party.find(room => room.id === roomElement.attr('id'));
  const sorted = !roomElement.data('sorted');
  roomElement.data('sorted', sorted);
  const guests = roomElement.find('.guest');
  const before = {};
  guests.each(function () { before[$(this).attr('data-name')] = $(this).offset(); });
  const order = sorted ? [...room.guests].sort((a, b) => a[2].localeCompare(b[2])) : room.guests;
  const container = roomElement.find('.guests');
  order.forEach(g => guests.filter('[data-name="' + g[0] + '"]').appendTo(container));
  guests.each(function () {
    const card = $(this);
    const after = card.offset();
    const start = before[card.attr('data-name')];
    card.css({ left: start.left - after.left, top: start.top - after.top })
      .animate({ left: 0, top: 0 }, 450);
  });
  roomElement.find('.sort').text(sorted ? 'Picture order' : 'Sort by time');
  $('#result').text(room.name + ': ' + (sorted ? 'sorted by arrival time.' : 'picture order restored.'));
}

$(function () {
  $('#house').on('click', '.guest', function () {
    const guest = $(this);
    // Finish a previous open/close before beginning another one.
    $('#guest-detail').stop(true, true);
    if (detailGuest) closeDetail(() => openDetail(guest));
    else openDetail(guest);
  });
  $('#house').on('keydown', '.guest', function (event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $(this).trigger('click'); }
  });
  $(document).on('click', '#overlay, .close-detail', function () { closeDetail(); });
  $(document).on('keydown', function (event) { if (event.key === 'Escape') closeDetail(); });
  $(document).on('click', '[data-move]', function () { if (detailGuest) moveGuest(detailGuest, $(this).attr('data-move')); });
  $('#house').on('click', '.sort', function () { sortRoom($(this).closest('.room')); });
});
