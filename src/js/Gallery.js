import $ from "jquery";

class Gallery {
  constructor() {
    this.imageUrl = [];
    this.tags = [{}];
    this.id = [];
    this.pageIndex = 0;
    this.bindClickFunction();
    this.renderGallery();
    this.bindTagFunction();
    this.detectView();
  }

  reset() {
    // To reset states to initial value
    this.imageUrl = [];
    this.tags = [{}];
    this.id = "";
    this.pageIndex = 0;

    $(".editor").empty();
    $(".save-btn").removeClass("edit");
    $(".pagination").remove();
  }

  navigate() {
    $(".pagination").remove();
    const hasPagination = this.imageUrl.length > 1;
    if (hasPagination) {
      const paginationDOM = `<div class="pagination">
          <button class="nav prev disabled"></button>
          <button class="nav next"></button>
          <div class="page-numbers">
            <span class="current-page">${
              this.pageIndex + 1
            }</span>&nbsp;of&nbsp;
            <span class="total-page">${this.imageUrl.length}</div>
          </div>
        </div>`;

      $(".modal-content").append($(paginationDOM));
    } else {
      $(".delete").remove();
    }

    if (this.pageIndex === this.imageUrl.length - 1) {
      $(".pagination .next").addClass("disabled");
    } else {
      $(".pagination .next").removeClass("disabled");
    }

    if (this.pageIndex === 0) {
      $(".pagination .prev").addClass("disabled");
    } else {
      $(".pagination .prev").removeClass("disabled");
    }

    $(`.image-wrapper:nth-child(${this.pageIndex + 1})`)
      .addClass("active")
      .siblings()
      .removeClass("active");

    $(".current-page").text(this.pageIndex + 1);
    $(".total-page").text(this.imageUrl.length);
  }

  bindClickFunction() {
    const that = this;
    const MAX_FILE_SIZE = 1 * 1000 * 1000; // 1MB

    // Private function
    function receiveImage(e) {
      const {
        target: { result },
      } = e;
      const img = `<div class="image-wrapper">
        <button class="delete"></button>
        <img src="${result}" />
      </div>`;

      $(".editor").append($(img));
      that.imageUrl.push(result);
      that.id = Date.now();
      $(".modal").addClass("show");
      that.navigate();
    }

    $(".add-image").change(function (e) {
      const currentInput = $(this);
      const files = currentInput[0].files;
      for (let i = 0; i < files.length; i++) {
        const fileReader = new FileReader();
        const fileSize = files[i].size;
        if (fileSize > MAX_FILE_SIZE) {
          alert("Maximum file size is 1MB");
          return;
        }
        fileReader.onload = receiveImage;
        fileReader.readAsDataURL(files[i]);
      }
    });

    /**
     * All the click events
     */
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

      const imagesDOM = imageUrl
        .map((image) => {
          return `<div class="image-wrapper"><button class="delete"></button><img src="${image}" /></div>`;
        })
        .join("");

      that.id = id;
      that.tags = tags;
      that.imageUrl = imageUrl;

      $(".editor").html($(imagesDOM));

      $("#image-modal").find(".save-btn").addClass("edit");
      that.renderTags(tags);
      that.navigate();
    });

    $(document).on("click", ".pagination .prev", function (e) {
      e.preventDefault();
      that.pageIndex--;
      that.navigate();
    });

    $(document).on("click", ".pagination .next", function (e) {
      e.preventDefault();
      that.pageIndex++;
      that.navigate();
    });

    $(document).on("click", ".image-wrapper .delete", function (e) {
      $(this).parents(".image-wrapper").remove();
      const parentIndex = $(this).parents(".image-wrapper").index();

      that.pageIndex = 0;
      that.tags = that.tags.splice(parentIndex, 1);
      that.imageUrl = that.imageUrl.splice(parentIndex, 1);
      that.navigate();
    });

    $(".toggle.view").click(function () {
      $(this).toggleClass("list");

      $(".image-view").toggleClass("list");

      const listMode = $(".image-view").hasClass("list") ? "list" : "grid";

      window.localStorage.setItem("listMode", listMode);
    });

    $(".toggle.darkmode").click(function () {
      $(this).toggleClass("dark");
      $("body").toggleClass("dark");
      const isDark = $("body").hasClass("dark");
      window.localStorage.setItem("isDark", isDark);
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
      if (listMode === "list") {
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
    tags.forEach((tag, index) => {
      const renderTags = Object.entries(tag)
        .map((item) => {
          const id = item[0];
          const { top, left, text } = item[1];
          return `<div class="tag" style="top: ${top}%; left: ${left}%;" data-id="${id}">${text}</div>`;
        })
        .join("");
      $(`.editor .image-wrapper:nth-child(${index + 1})`).append($(renderTags));
    });
  }

  bindTagFunction() {
    const that = this;
    $(document).on("click", ".editor img", function (e) {
      const { offsetX, offsetY } = e;
      /**
       * Image is an array, use index to get each image ID
       * @type {*|Window.jQuery}
       */
      const imageIndex = $(this).parents(".image-wrapper").index();

      const id = Date.now();
      const width = $(e.target).width();
      const height = $(e.target).height();
      const top = (offsetY / height) * 100;
      const left = (offsetX / width) * 100;

      const tag = `<div class="tag" style="top: ${top}%; left: ${left}%;" data-id="${id}"></div>`;
      $(e.target)
        .parents(".editor")
        .find(`.image-wrapper:nth-child(${imageIndex + 1})`)
        .append($(tag));

      if (that.tags[imageIndex]) {
        that.tags[imageIndex][id] = {
          top: top,
          left: left,
        };
      } else {
        that.tags[imageIndex] = {};
        that.tags[imageIndex][id] = {};
      }

      setTimeout(function () {
        $(e.target)
          .parents(".editor")
          .find(`.image-wrapper:nth-child(${imageIndex + 1}) .tag:last-child`)
          .click();
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
      const parentIndex = $(this).parents(".image-wrapper").index();

      const value = tag.text();
      tag.attr("contenteditable", false);
      $(e.target).parents(".editor").find("img").removeClass("disabled");

      if (!tag.text()) {
        tag.remove();
        delete that.tags[parentIndex][id];
      } else {
        that.tags[parentIndex][id].text = value;
      }
    });

    $(document).on("mousedown", ".tag", function (e) {
      const dr = $(this).addClass("drag").css("cursor", "move");
      const parentIndex = $(this).parents(".image-wrapper").index();
      const boundary = $(this)
        .parents(".editor")
        .find(`.image-wrapper:nth-child(${parentIndex + 1}) img`);
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
        .off("mousemove")
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
        .off("mouseup")
        .on("mouseup", function (e) {
          dr.removeClass("drag");

          if (that.tags[parentIndex] && that.tags[parentIndex][id]) {
            that.tags[parentIndex][id].top =
              (dr[0].offsetTop / boundaryHeight) * 100;
            that.tags[parentIndex][id].left =
              (dr[0].offsetLeft / boundaryWidth) * 100;
          }
        });
    });
  }

  renderGallery() {
    const data = this.getData();

    if (data.length !== 0) {
      const images = data
        .map((item) => {
          const { id, imageUrl, tags } = item;
          /**
           * Display the first image in Thumbnails if > 1 image
           */
          const tagArr = Object.entries(tags[0]);
          return `<div class="thumbnail-wrapper">
          <div
            class="thumbnail-cover"
            style="background-image: url(${imageUrl[0]})"
          ></div>
          <div class="thumbnail" data-id="${id}">
            <img class="thumbnail-image" src="${imageUrl[0]}" />
            ${tagArr
              .map((tag) => {
                const key = tag[0];
                const { left, top, text } = tag[1];
                return `<div class="thumbnail-tag" data-id="${key}" style="left: ${left}%; top: ${top}%;">${text}</div>`;
              })
              .join("")}
          </div>
          ${
            imageUrl.length > 1
              ? `<div class="count">${imageUrl.length}</div>`
              : ""
          }
        </div>`;
        })
        .join("");

      $(".image-view").html($(images));
    } else {
      const placeholder = `<div class="placeholder">
        <div class="placeholder-image"></div>No image yet
      </div>`;

      $(".image-view").html($(placeholder));
    }
  }
}

export default Gallery;
