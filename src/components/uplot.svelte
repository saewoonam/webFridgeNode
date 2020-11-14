<svelte:head>
  <link rel="stylesheet" href="https://leeoniya.github.io/uPlot/dist/uPlot.min.css">
  <script src="https://leeoniya.github.io/uPlot/dist/uPlot.iife.js" type="text/javascript" on:load={uPlotLoaded}></script>
</svelte:head>

<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
  // import { onMount } from 'svelte';
  /* import {test, wheelZoomPlugin} from './config.svelte'; */
  import filesaver from 'file-saver';
  // import uPlot from 'uplot'
  // console.log(uPlot)
  const colors = ['lavender',
    'thistle',
    'plum',
    'violet',
    'orchid',
    'fuchsia',
    'magenta',
    'mediumorchid',
    'mediumpurple',
    'blueviolet',
    'darkviolet',
    'darkorchid',
    'darkmagenta',
    'purple',
    'indigo'
    ]
  const colors_blue = ["#E1F5F3", 
                 "#B3E5FC",
                 "#81D4FA",
                 "#4FC3F7",
                 "#29B6F6",
                 "#03A9F4",
                 "#039BE5",
                 "#0288D1",
                 "#0244BD",
                 "#01579B"]
  let name = 'world';
  let mounted = false;
  let uPlotValid = false;
  let autox = true;
  let mouse = false;
  let uplot;
  afterUpdate( ()=> {
    if(uplot) uplot.setData(data);
  })
  export let data;
  export let options = {
      title: "Chart Component",
      width: 600,
      height: 300,
      series: [
        {},
        {
          spanGaps: true,
          // in-legend display
          label: "y1",
          stroke: "red",
          width: 1,
          dash: [10, 5],
        },
        {
          spanGaps: true,
          label: "y2",
          stroke: "blue",
          width: 1,
        }
      ]
  }
  console.log(data)
  console.log(options.series)
  let s = [{}]
  for (let i=0; i<data.length-1; i++) {
    s.push({
      spanGaps: true,
      label: "y"+i,
      stroke: colors[9-i],
      width: 2
    })
  }
  options.series = s;
  console.log(options.series)
  function saveCanvas()  
  {
    var canvas = document.querySelector(".u-wrap > canvas:nth-child(2)");
    console.log("canvas", canvas)
    canvas.toBlob(function(blob) {
      filesaver.saveAs(blob, "uplot.png");
    });
  }
  const loadPlot = function() {
    console.log("loadPlot");
    function wheelZoomPlugin(opts) {
      let factor = opts.factor || 0.75;
      let xMin, xMax, yMin, yMax, xRange, yRange;

      function clamp(nRange, nMin, nMax, fRange, fMin, fMax) {
        if (nRange > fRange) {
          nMin = fMin;
          nMax = fMax;
        }
        else if (nMin < fMin) {
          nMin = fMin;
          nMax = fMin + nRange;
        }
        else if (nMax > fMax) {
          nMax = fMax;
          nMin = fMax - nRange;
        }

        return [nMin, nMax];
      }

      return {
        hooks: {
          ready: u => {
            xMin = u.scales.x.min;
            xMax = u.scales.x.max;
            yMin = u.scales.y.min;
            yMax = u.scales.y.max;

            xRange = xMax - xMin;
            yRange = yMax - yMin;

            let plot = u.root.querySelector(".u-over");
            let rect = plot.getBoundingClientRect();

            // shift clock drag pan
            plot.addEventListener("mousedown", e => {
              //console.log('mousedown, e:', e);
              if ((e.button == 0)&&(e.shiftKey)) {
              //  plot.style.cursor = "move";
                // if (u.autox) u.autox = false;
                if (u.autox) {
                  autox = false;
                  u.autox = false;
                }
                console.log('u',u)
                e.preventDefault();

                let left0 = e.clientX;
              //  let top0 = e.clientY;

                let scXMin0 = u.scales.x.min;
                let scXMax0 = u.scales.x.max;

                let xUnitsPerPx = u.posToVal(1, 'x') - u.posToVal(0, 'x');

                function onmove(e) {
                  if ((e.button == 0) && (e.shiftKey)) {
                    e.preventDefault();
                    console.log('onmove, e:', e);

                    let left1 = e.clientX;
                  //  let top1 = e.clientY;

                    let dx = xUnitsPerPx * (left1 - left0);

                    u.setScale('x', {
                      min: scXMin0 - dx,
                      max: scXMax0 - dx,
                    });
                  }
                }

                function onup(e) {
                  console.log('onup, e:', e);
                  document.removeEventListener("mousemove", onmove);
                  document.removeEventListener("mouseup", onup);
                }
                console.log("add mousemove, mouseup");
                document.addEventListener("mousemove", onmove);
                document.addEventListener("mouseup", onup);
              }
            });

            // wheel scroll zoom
            plot.addEventListener("wheel", e => {
              // if (u.autox) u.autox = false;
              if (u.autox) {
                autox = false;
                u.autox = false;
              }
              e.preventDefault();

              let {left, top} = u.cursor;

              let leftPct = left/rect.width;
              let btmPct = 1 - top/rect.height;
              let xVal = u.posToVal(left, "x");
              let yVal = u.posToVal(top, "y");
              let oxRange = u.scales.x.max - u.scales.x.min;
              let oyRange = u.scales.y.max - u.scales.y.min;

              let nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor;
              let nxMin = xVal - leftPct * nxRange;
              let nxMax = nxMin + nxRange;
              [nxMin, nxMax] = clamp(nxRange, nxMin, nxMax, xRange, xMin, xMax);

              let nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor;
              let nyMin = yVal - btmPct * nyRange;
              let nyMax = nyMin + nyRange;
              [nyMin, nyMax] = clamp(nyRange, nyMin, nyMax, yRange, yMin, yMax);

              u.batch(() => {
                u.setScale("x", {
                  min: nxMin,
                  max: nxMax,
                });

                u.setScale("y", {
                  min: nyMin,
                  max: nyMax,
                });
              });
            });
          }
        }
      };
    }

    let opts = {
      title: options.title,
      width: options.width,
      height: options.height,
      plugins: [
        wheelZoomPlugin({factor: 0.75})
      ],
      scales: {
        x:{
          auto: (a,b,c)=> {
            console.log('scales a.auto', a.autox, autox);
            return a.autox},
        },
        y: {
          range: {min:0, max:100},
        }
      },
      cursor: { 
        bind: {
          dblclick: (u, targ, handler) => {
            return e => {
                console.log('in dblclick, autox', autox)
                if(!u.autox) set_autox();
                console.log('out dblclick, autox', autox)
                handler(e)              
            } 
          },
          mouseup: (u, targ, handler) => {
            return e => {
              mouse = false;
              // console.log('mouseup button', e.button, 'buttons', e.buttons, e, mouse);
              if (!e.shiftKey) {
                if(u.autox) clear_autox();
                handler(e)
              }; // pass to handler if shift key not pressed
            }
          },
          mousedown: (u, targ, handler) => {
            return e => {
              mouse = true;
              // console.log('mousedown button', e.button, 'buttons', e.buttons, e, mouse);
              if (!e.shiftKey) handler(e);
            }
          },
          mousemove: (u, targ, handler) => {
            return e => {
              if (mouse & e.buttons==1) {
                // console.log('mousemove button', e.button, 'buttons', e.buttons, mouse);
              if (!e.shiftKey) handler(e);
              }
            }           
          },

        },
        drag:  
          { x: true, y: true, uni: 1 }, 
      },
      series: options.series,
//       series: [
//         {},
//         {
//           spanGaps: true,
//           // in-legend display
//           label: "y1",
//           stroke: "red",
//           width: 1,
//           dash: [10, 5],
//         },
//         {
//           spanGaps: true,
//           label: "y2",
//           stroke: "blue",
//           width: 1,
//         }
//       ],
    };
    // let uplot = new uPlot(opts, data, document.body);
    console.log('uPlot', uPlot)
    uplot = new uPlot(opts, data, plot_div);
    uplot.autox = autox
    uplot.test = 'abc'
    console.log(uplot)
  }
  const clear_autox = () => {
    autox = false;
    uplot.autox = autox
  }
  const set_autox = () => {
    autox = true;
    uplot.autox = autox
  }
  const toggle_autox = () => {
    autox = !autox
    uplot.autox = !uplot.autox
    if(uplot.autox) uplot.setData(data); // redraw isn't working
    // console.log('toggle', autox, uplot.autox)
  }
  const fixed_y = () => {
    console.log('fixed_y')
    uplot.batch(() => {
      uplot.setScale('y', {min: -100, max:100,})
    });
  }
  const uPlotLoaded = () => {
    uPlotValid = true;
    console.log("uPlotLoaded");
    loadPlot();
  }
</script>
<p>
  data[0].length = {data[0].length}
</p>
<button on:click={toggle_autox}>
  {#if autox}
  disable
  {:else}
  enable
  {/if}
  autoscale x
</button>
<button on:click={saveCanvas}>
  print
</button>
<!-- <button on:click={fixed_y}>
  y [0, 100]
</button> -->
<div id=plot_div></div>

