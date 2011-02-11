var artillery = {
  mortar:[270, 271, 272, 273],
  catapult:[133, 134, 135, 136],
  ram: [76, 77, 78, 79],
};

function Wall(level,vs){
  this.rounds = function(count){
    count = count || 18;
    return Math.ceil(7*this.hitsPerSection/count);
  }
  this.simulate = function(n,sections,round){
    if (mode == 'active' && (sections == 0 || this.dmgRecieved == 0))
      return {
        remain  : 0,
        sections: 0,
        history : [],
        rounds  : round
      };
    else if (mode == 'inactive' && (sections <= 6 || this.dmgRecieved == 0))
      return {
        remain  : 0,
        sections: 0,
        history : [],
        rounds  : round
      };
    else {
      sections = sections || 7;
      n = n || 18;
      round = round || 0;
      var remain = Math.max(sections-n/this.hitsPerSection,0);
      var nextRound = this.simulate(n,remain,round+1);
      nextRound.history.unshift(Math.ceil(remain));
      return {
        remain   : remain,
        sections : Math.ceil(remain)+nextRound.sections,
        history  : nextRound.history,
        rounds   : nextRound.rounds
      };
    }
  }
  this.minArtillery = function(){
    var base = this.simulate(18).sections;
    if (this.hitsPerSection > 3) return 18; // limited ammo for mortars
    for (var i = 17; i >= 7; --i){
      if (this.simulate(i).sections > base) break;
    }
    return i + 1;
  }
  this.level = level;
  this.armor = 4 * level;
  this.hp    = 100+50*level;
  this.dmgRecieved = Math.max(vs - this.armor,0);
  this.hitsPerSection = Math.ceil(this.hp/this.dmgRecieved);
  this.attack = 50 + 10 * this.level;
  if (this.level < 20) this.attack = 30 + 5 * this.level;
  if (this.level < 10) this.attack = 10 + 2 * this.level;
}

function calculate(dmg){
  dmg = dmg || artillery.mortar[3];
  $('#damage').val(dmg);
  var output = '';
  var count = $('#count').val();
  if (mode == 'inactive') {
    $("#main > thead > tr").html('<th>level</th><th>hp</th><th>armor</th><th>attack</th>');
    for (var i = 1; i <= 35; ++i){
      var wall = new Wall(i,dmg);
      output += '<tr><th>'+[
        i,
        wall.hp, wall.armor,
        wall.attack].join('<td>');
        
        var lastTotalDamage = 0;
        for (var n_artillery = 1; n_artillery <= 18; ++n_artillery) {
          var simulation = wall.simulate(n_artillery);
          var totalDamage = simulation.sections * wall.attack;
          var className = '';
          if (totalDamage <  13) className = 'spear';
          else if (totalDamage <  18) className = 'sword';
          else if (totalDamage <  56) className = 'hop';
          else if (totalDamage <  184) className = 'sg';
          if (simulation.rounds == 1 && lastTotalDamage != totalDamage) {
            output += '<td class="'+className+' right">'
              + '<strong>' + n_artillery + '</strong> / '
              + simulation.sections + ' / '
              + totalDamage
            lastTotalDamage = totalDamage;
          }
        }
      delete wall;
    }
  } else {
    $("#main > thead > tr").html('<th>level</th><th>hp</th><th>armor</th><th>attack</th><th>rounds</th><th>#</th><th>losses</th><th>damage</th>');
    for (var i = 1; i <= 35; ++i){
      var wall = new Wall(i,dmg);
      var min = !count || isNaN(count) ? wall.minArtillery() : count;
      var simulation = wall.simulate(min);
      output += '<tr><th>'+[
        i,
        wall.hp, wall.armor,
        wall.attack,
        simulation.rounds,
        min,
        simulation.history.join(' + ') + ' = ' + simulation.sections,
        simulation.sections * wall.attack
      ].join('<td>');
      delete wall;
    }
  }
  $("#main > tbody").html(output);
}

function run(){
  mode = $('input[name=mode]:checked').val();
  var type = $('input[name=artillery]:checked').val() || 'mortar';
  var upgrade = $('input[name=upgrade]:checked').val() || 0;
  calculate(artillery[type][upgrade]);
}

var mode = 'inactive';

$(function(){
  $('#dec').click(function(){
    var count = $('#count').val();
    if (count == '') count = 17;
    else if (count == 1) count = 1;
    else --count;
    $('#count').val(count);
    run();
    return false;
  });
  $('#inc').click(function(){
    var count = $('#count').val();
    if (count == '') count = 1;
    else if (count == 18) count = 18;
    else ++count;
    $('#count').val(count);
    run();
    return false;
  });
  run();
  $('input').click(run);
  $('#count').change(run);
});
