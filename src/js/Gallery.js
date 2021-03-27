import $ from "jquery";

class Gallery {
  constructor() {
    this.imageUrl = "";
    this.tags = {};
    this.id = null;
    this.bindClickFunction();
    this.renderGallery();
    this.bindTagFunction();
    this.detectView();
  }

  reset() {
    this.imageUrl = "";
    this.tags = {};
    this.id = null;

    $(".editor").empty();
    $(".save-btn").removeClass("edit");
  }

  bindClickFunction() {
    const that = this;
    function receiveImage(e) {
      const {
        target: { result },
      } = e;
      const img = `<img src="${result}" />`;
      $(".editor").append($(img));
      that.imageUrl = result;
      that.id = Date.now();
      $(".modal").addClass("show");
    }

    $(".add-image").change(function (e) {
      const currentInput = $(this);
      const files = currentInput[0].files;
      for (let i = 0; i < files.length; i++) {
        const fileReader = new FileReader();
        fileReader.onload = receiveImage;
        fileReader.readAsDataURL(files[i]);
      }
    });

    $(document).on("click", ".image-view .thumbnail", function (e) {
      const thumbnail = $(e.target);

      const { top, left } = thumbnail.offset();
      $(".modal").css("transform-origin", `${left}px ${top}px`);

      setTimeout(function () {
        $(".modal").addClass("show");
      }, 200);

      const id = $(this).data("id");
      const data = that.getData(id);
      const { imageUrl, tags } = data[0];
      const img = `<img src="${imageUrl}" />`;

      that.id = id;
      that.tags = tags;
      that.imageUrl = imageUrl;

      $(".editor").html($(img));
      $("#image-modal").find(".save-btn").addClass("edit");
      that.renderTags(tags);
    });

    $(".toggle.view").click(function () {
      $(this).toggleClass("list");

      $(".image-view").toggleClass("list");

      window.localStorage.setItem("dark");
    });

    $(".toggle.darkmode").click(function () {
      $(this).toggleClass("dark");
      $("body").toggleClass("dark");
      const isDark = $("body").hasClass("dark");
      window.localStorage.setItem("isDark", isDark);
    });
  }

  detectView() {
    const isDark = window.localStorage.getItem("isDark");
    const listMode = window.localStorage.getItem("listMode");

    if (isDark) {
      const dark = JSON.parse(isDark);
      if (dark) {
        $(".toggle.darkmode").addClass("dark");
        $("body").addClass("dark");
      } else {
        $(".toggle.darkmode").removeClass("dark");
        $("body").removeClass("dark");
      }
    }

    if (listMode) {
      const mode = JSON.parse(listMode);
      if (mode === "list") {
        $(".toggle.view").addClass("list");
        $(".image-view").addClass("list");
      } else {
        $(".toggle.view").removeClass("list");
        $(".image-view").removeClass("list");
      }
    }
  }

  setItem(value, key) {
    const currentData = window.localStorage.getItem("data");

    let tmpData = [];
    if (currentData) {
      tmpData = [...JSON.parse(currentData)];
    }

    if (key) {
      tmpData = tmpData.filter((item) => item.id !== key);
      tmpData.push(value);
    } else {
      tmpData.push(value);
    }

    window.localStorage.setItem("data", JSON.stringify(tmpData));
  }

  getData(id) {
    const currentData = window.localStorage.getItem("data");
    const filteredData = id
      ? JSON.parse(currentData).filter((item) => item.id === id)
      : JSON.parse(currentData);
    return filteredData ? filteredData : [];
  }

  renderTags(tags) {
    const renderTags = Object.entries(tags)
      .map((item) => {
        const id = item[0];
        const { top, left, text } = item[1];
        return `<div class="tag" style="top: ${top}%; left: ${left}%;" data-id="${id}">${text}</div>`;
      })
      .join("");
    $(".editor").append($(renderTags));
  }

  bindTagFunction() {
    const that = this;
    $(document).on("click", ".editor img", function (e) {
      const { offsetX, offsetY } = e;
      const id = Date.now();
      const width = $(e.target).width();
      const height = $(e.target).height();
      const top = (offsetY / height) * 100;
      const left = (offsetX / width) * 100;

      const tag = `<div class="tag" style="top: ${top}%; left: ${left}%;" data-id="${id}"></div>`;
      $(e.target).parent(".editor").append($(tag));

      that.tags[id] = {
        top: top,
        left: left,
      };

      setTimeout(function () {
        $(e.target).parent(".editor").find(".tag:last-child").click();
        $(e.target).addClass("disabled");
      }, 100);
    });

    $(document).on("click", ".tag", function (e) {
      const tag = $(e.target);
      tag.attr("contenteditable", true).focus();
    });

    $(document).on("blur", ".tag", function (e) {
      const tag = $(e.target);
      const id = tag.data("id");
      const value = tag.text();
      tag.attr("contenteditable", false);
      $(e.target).parent(".editor").find("img").removeClass("disabled");

      if (!tag.text()) {
        tag.remove();
        delete that.tags[id];
      } else {
        that.tags[id].text = value;
      }
    });

    $(document).on("mousedown", ".tag", function (e) {
      const dr = $(this).addClass("drag").css("cursor", "move");
      const boundary = $(this).parent(".editor").find("img");
      const id = $(this).data("id");
      const boundaryWidth = boundary.width();
      const boundaryHeight = boundary.height();

      const height = dr.outerHeight();
      const width = dr.outerWidth();
      const max_left =
        dr.parent().offset().left + dr.parent().width() - dr.width();
      const max_top =
        dr.parent().offset().top + dr.parent().height() - dr.height();
      const min_left = dr.parent().offset().left;
      const min_top = dr.parent().offset().top;

      const ypos = dr.offset().top + height - e.pageY,
        xpos = dr.offset().left + width - e.pageX;
      $(document.body)
        .on("mousemove", function (e) {
          let itop = e.pageY + ypos - height;
          let ileft = e.pageX + xpos - width;

          if (dr.hasClass("drag")) {
            if (itop <= min_top) {
              itop = min_top;
            }
            if (ileft <= min_left) {
              ileft = min_left;
            }
            if (itop >= max_top) {
              itop = max_top;
            }
            if (ileft >= max_left) {
              ileft = max_left;
            }
            dr.offset({ top: itop, left: ileft });
          }
        })
        .on("mouseup", function (e) {
          dr.removeClass("drag");

          if (that.tags[id]) {
            that.tags[id].top = (dr[0].offsetTop / boundaryHeight) * 100;
            that.tags[id].left = (dr[0].offsetLeft / boundaryWidth) * 100;
          }
        });
    });

    $(".save-btn").click(function (e) {
      e.preventDefault();
      const isEdit = $(this).hasClass("edit");

      if (isEdit) {
        that.setItem(
          {
            imageUrl: that.imageUrl,
            tags: that.tags,
            id: that.id,
          },
          that.id
        );
      } else {
        that.setItem({
          imageUrl: that.imageUrl,
          tags: that.tags,
          id: that.id,
        });
      }

      $(".modal").removeClass("show");

      that.renderGallery();
      that.reset();
    });
  }

  renderGallery() {
    const data = this.getData();
    const images = data
      .map((item) => {
        const { id, imageUrl, tags } = item;
        const tagArr = Object.entries(tags);
        return `<div class="thumbnail-wrapper">
          <div class="thumbnail-cover" style="background-image: url(${imageUrl})"></div>
          <div class="thumbnail" data-id="${id}">
            <img class="thumbnail-image" src="${imageUrl}" />
            ${tagArr
              .map((tag) => {
                const key = tag[0];
                const { left, top, text } = tag[1];
                return `<div class="thumbnail-tag" data-id="${key}" style="left: ${left}%; top: ${top}%;">${text}</div>`;
              })
              .join("")}
          </div>
        </div>`;
      })
      .join("");

    $(".image-view").html($(images));
  }
}

export default Gallery;
